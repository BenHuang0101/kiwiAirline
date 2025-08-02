const express = require('express');
const Joi = require('joi');
const { query } = require('../config/database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// 聯絡表單驗證規則
const contactFormSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': '姓名至少需要2個字元',
    'string.max': '姓名不能超過100個字元',
    'any.required': '姓名為必填欄位'
  }),
  email: Joi.string().email().required().messages({
    'string.email': '請輸入有效的電子郵件地址',
    'any.required': '電子郵件為必填欄位'
  }),
  phone: Joi.string().pattern(/^\+?[1-9]\d{7,14}$/).allow('').messages({
    'string.pattern.base': '請輸入有效的電話號碼'
  }),
  subject: Joi.string().min(5).max(200).required().messages({
    'string.min': '主題至少需要5個字元',
    'string.max': '主題不能超過200個字元',
    'any.required': '主題為必填欄位'
  }),
  category: Joi.string().valid(
    'booking',
    'cancellation',
    'refund',
    'flight_info',
    'special_assistance',
    'baggage',
    'technical',
    'feedback',
    'other'
  ).required().messages({
    'any.only': '請選擇有效的問題類別',
    'any.required': '問題類別為必填欄位'
  }),
  message: Joi.string().min(10).max(2000).required().messages({
    'string.min': '訊息內容至少需要10個字元',
    'string.max': '訊息內容不能超過2000個字元',
    'any.required': '訊息內容為必填欄位'
  }),
  bookingNumber: Joi.string().pattern(/^KW\d{8}[A-Z0-9]{4}$/).allow('').messages({
    'string.pattern.base': '預訂編號格式不正確'
  }),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal')
});

// 獲取常見問題
router.get('/faq', async (req, res) => {
  try {
    const category = req.query.category;
    const search = req.query.search;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT 
        faq_id,
        category,
        question,
        answer,
        display_order,
        is_featured,
        view_count,
        created_at,
        updated_at
      FROM faqs 
      WHERE is_active = TRUE
    `;
    
    const params = [];

    // 按類別篩選
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    // 搜尋功能
    if (search) {
      sql += ' AND (question LIKE ? OR answer LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // 排序：特色問題優先，然後按顯示順序和瀏覽次數
    sql += ' ORDER BY is_featured DESC, display_order ASC, view_count DESC';
    
    // 分頁
    sql += ` LIMIT ${limit} OFFSET ${offset}`;

    const faqs = await query(sql, params);

    // 獲取總數量
    let countSql = 'SELECT COUNT(*) as total FROM faqs WHERE is_active = TRUE';
    let countParams = [];

    if (category) {
      countSql += ' AND category = ?';
      countParams.push(category);
    }

    if (search) {
      countSql += ' AND (question LIKE ? OR answer LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await query(countSql, countParams);

    // 獲取所有可用的類別
    const categories = await query(`
      SELECT 
        category,
        COUNT(*) as count
      FROM faqs 
      WHERE is_active = TRUE 
      GROUP BY category 
      ORDER BY category
    `);

    const formattedFaqs = faqs.map(faq => ({
      id: faq.faq_id,
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      isFeatured: faq.is_featured,
      viewCount: faq.view_count,
      createdAt: faq.created_at,
      updatedAt: faq.updated_at
    }));

    const formattedCategories = categories.map(cat => ({
      category: cat.category,
      count: cat.count,
      displayName: getCategoryDisplayName(cat.category)
    }));

    res.json({
      success: true,
      data: {
        faqs: formattedFaqs,
        categories: formattedCategories,
        pagination: {
          page,
          limit,
          total: countResult.total,
          totalPages: Math.ceil(countResult.total / limit),
          hasNext: page * limit < countResult.total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('獲取FAQ錯誤:', error);
    res.status(500).json({
      error: '獲取常見問題失敗',
      code: 'GET_FAQ_ERROR'
    });
  }
});

// 獲取特定FAQ詳情（增加瀏覽次數）
router.get('/faq/:faqId', async (req, res) => {
  try {
    const { faqId } = req.params;

    if (!faqId || isNaN(faqId)) {
      return res.status(400).json({
        error: '無效的FAQ ID',
        code: 'INVALID_FAQ_ID'
      });
    }

    // 獲取FAQ詳情
    const faqs = await query(`
      SELECT 
        faq_id,
        category,
        question,
        answer,
        is_featured,
        view_count,
        created_at,
        updated_at
      FROM faqs 
      WHERE faq_id = ? AND is_active = TRUE
    `, [faqId]);

    if (faqs.length === 0) {
      return res.status(404).json({
        error: 'FAQ不存在',
        code: 'FAQ_NOT_FOUND'
      });
    }

    const faq = faqs[0];

    // 增加瀏覽次數
    await query(
      'UPDATE faqs SET view_count = view_count + 1 WHERE faq_id = ?',
      [faqId]
    );

    // 獲取相關FAQ（同類別的其他熱門問題）
    const relatedFaqs = await query(`
      SELECT 
        faq_id,
        question,
        view_count
      FROM faqs 
      WHERE category = ? AND faq_id != ? AND is_active = TRUE
      ORDER BY view_count DESC
      LIMIT 5
    `, [faq.category, faqId]);

    res.json({
      success: true,
      data: {
        id: faq.faq_id,
        category: faq.category,
        categoryDisplayName: getCategoryDisplayName(faq.category),
        question: faq.question,
        answer: faq.answer,
        isFeatured: faq.is_featured,
        viewCount: faq.view_count + 1, // 返回更新後的瀏覽次數
        createdAt: faq.created_at,
        updatedAt: faq.updated_at,
        relatedFaqs: relatedFaqs.map(related => ({
          id: related.faq_id,
          question: related.question,
          viewCount: related.view_count
        }))
      }
    });

  } catch (error) {
    console.error('獲取FAQ詳情錯誤:', error);
    res.status(500).json({
      error: '獲取FAQ詳情失敗',
      code: 'GET_FAQ_DETAILS_ERROR'
    });
  }
});

// 提交聯絡表單
router.post('/contact', optionalAuth, async (req, res) => {
  try {
    // 驗證表單資料
    const { error, value } = contactFormSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: '表單資料驗證失敗',
        code: 'VALIDATION_ERROR',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    const {
      name,
      email,
      phone,
      subject,
      category,
      message,
      bookingNumber,
      priority
    } = value;

    const userId = req.user ? req.user.userId : null;

    // 生成詢問編號
    const inquiryNumber = generateInquiryNumber();

    // 插入聯絡請求
    const result = await query(`
      INSERT INTO contact_requests (
        user_id,
        inquiry_number,
        name,
        email,
        phone,
        subject,
        category,
        message,
        booking_number,
        priority,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', NOW())
    `, [
      userId,
      inquiryNumber,
      name,
      email,
      phone || null,
      subject,
      category,
      message,
      bookingNumber || null,
      priority
    ]);

    // 發送確認郵件（在實際應用中）
    // await sendContactConfirmationEmail(email, inquiryNumber, name);

    res.status(201).json({
      success: true,
      message: '您的詢問已成功提交',
      data: {
        inquiryNumber,
        estimatedResponseTime: getEstimatedResponseTime(priority),
        trackingUrl: `/support/contact/${inquiryNumber}`
      }
    });

  } catch (error) {
    console.error('提交聯絡表單錯誤:', error);
    res.status(500).json({
      error: '提交聯絡表單失敗',
      code: 'CONTACT_SUBMISSION_ERROR'
    });
  }
});

// 查詢聯絡請求狀態
router.get('/contact/:inquiryNumber', async (req, res) => {
  try {
    const { inquiryNumber } = req.params;

    // 驗證詢問編號格式
    if (!/^INQ\d{8}[A-Z0-9]{4}$/.test(inquiryNumber)) {
      return res.status(400).json({
        error: '無效的詢問編號格式',
        code: 'INVALID_INQUIRY_NUMBER'
      });
    }

    const contacts = await query(`
      SELECT 
        inquiry_number,
        name,
        email,
        subject,
        category,
        message,
        priority,
        status,
        admin_response,
        created_at,
        responded_at,
        resolved_at
      FROM contact_requests 
      WHERE inquiry_number = ?
    `, [inquiryNumber]);

    if (contacts.length === 0) {
      return res.status(404).json({
        error: '查無此詢問記錄',
        code: 'INQUIRY_NOT_FOUND'
      });
    }

    const contact = contacts[0];

    res.json({
      success: true,
      data: {
        inquiryNumber: contact.inquiry_number,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        category: contact.category,
        categoryDisplayName: getCategoryDisplayName(contact.category),
        message: contact.message,
        priority: contact.priority,
        status: contact.status,
        statusDisplayName: getStatusDisplayName(contact.status),
        adminResponse: contact.admin_response,
        createdAt: contact.created_at,
        respondedAt: contact.responded_at,
        resolvedAt: contact.resolved_at,
        estimatedResponseTime: contact.responded_at ? null : getEstimatedResponseTime(contact.priority)
      }
    });

  } catch (error) {
    console.error('查詢聯絡請求錯誤:', error);
    res.status(500).json({
      error: '查詢聯絡請求失敗',
      code: 'GET_CONTACT_REQUEST_ERROR'
    });
  }
});

// 獲取支援統計資訊
router.get('/stats', async (req, res) => {
  try {
    // 獲取熱門FAQ
    const popularFaqs = await query(`
      SELECT 
        faq_id,
        question,
        view_count,
        category
      FROM faqs 
      WHERE is_active = TRUE 
      ORDER BY view_count DESC 
      LIMIT 5
    `);

    // 獲取問題類別統計
    const categoryStats = await query(`
      SELECT 
        category,
        COUNT(*) as total_requests,
        AVG(CASE WHEN status = 'resolved' THEN 
          TIMESTAMPDIFF(HOUR, created_at, resolved_at) 
        END) as avg_resolution_hours
      FROM contact_requests 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY category
      ORDER BY total_requests DESC
    `);

    // 獲取回應時間統計
    const responseStats = await query(`
      SELECT 
        AVG(TIMESTAMPDIFF(HOUR, created_at, responded_at)) as avg_response_hours,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count,
        COUNT(*) as total_count
      FROM contact_requests 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    const stats = responseStats[0] || {};

    res.json({
      success: true,
      data: {
        popularFaqs: popularFaqs.map(faq => ({
          id: faq.faq_id,
          question: faq.question,
          viewCount: faq.view_count,
          category: faq.category,
          categoryDisplayName: getCategoryDisplayName(faq.category)
        })),
        categoryStats: categoryStats.map(stat => ({
          category: stat.category,
          categoryDisplayName: getCategoryDisplayName(stat.category),
          totalRequests: stat.total_requests,
          avgResolutionHours: Math.round(stat.avg_resolution_hours || 0)
        })),
        responseStats: {
          avgResponseHours: Math.round(stats.avg_response_hours || 0),
          resolutionRate: stats.total_count > 0 ? 
            Math.round((stats.resolved_count / stats.total_count) * 100) : 0,
          totalRequests: stats.total_count || 0
        }
      }
    });

  } catch (error) {
    console.error('獲取支援統計錯誤:', error);
    res.status(500).json({
      error: '獲取支援統計失敗',
      code: 'GET_SUPPORT_STATS_ERROR'
    });
  }
});

// 輔助函數
function generateInquiryNumber() {
  const prefix = 'INQ';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

function getCategoryDisplayName(category) {
  const categoryNames = {
    'booking': '預訂相關',
    'cancellation': '取消相關',
    'refund': '退款相關',
    'flight_info': '航班資訊',
    'special_assistance': '特殊協助',
    'baggage': '行李相關',
    'technical': '技術問題',
    'feedback': '意見回饋',
    'other': '其他問題'
  };
  return categoryNames[category] || category;
}

function getStatusDisplayName(status) {
  const statusNames = {
    'new': '新建',
    'in_progress': '處理中',
    'waiting_for_customer': '等待客戶回覆',
    'resolved': '已解決',
    'closed': '已關閉'
  };
  return statusNames[status] || status;
}

function getEstimatedResponseTime(priority) {
  const responseTimes = {
    'urgent': '2小時內',
    'high': '6小時內',
    'normal': '24小時內',
    'low': '48小時內'
  };
  return responseTimes[priority] || '24小時內';
}

module.exports = router;
