export interface CourseConfig {
  hasPreTest: boolean;
  minPreTestScore?: number;
  isPaid: boolean;
  price?: number;
  hasExam: boolean;
  hasCertificate: boolean;
  hasAIModel: boolean;
  enableAI: boolean;
  enableLessonQA: boolean;
  isLocked: boolean; 
  courseType: 'full_course' | 'ai_tool_only';
  category: 'certificate' | 'fast_track' | 'personal_ai' | 'business_ai';
  agent_id_he?: string;
  agent_id_en?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  question_he?: string;
  question_en?: string;
  options: string[];
  options_he?: string[];
  options_en?: string[];
  correctAnswer: number;
}

export interface Lesson {
  id: string;
  title: string;
  title_he?: string;
  title_en?: string;
  duration: string;
  completed: boolean;
  content: string;
  content_he?: string;
  content_en?: string;
  videoUrl?: string;
  quiz?: QuizQuestion[];
}

export interface Module {
  id: string;
  title: string;
  title_he?: string;
  title_en?: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  title_he?: string;
  title_en?: string;
  problemSolved: string;
  problemSolved_he?: string;
  problemSolved_en?: string;
  duration: string;
  image: string;
  modules: Module[];
  config: CourseConfig;
  preTest?: QuizQuestion[];
  visibility: string[]; // ['he'], ['en'], or ['he', 'en']
}

export interface Article {
  id: string;
  title: string;
  title_he?: string;
  title_en?: string;
  excerpt: string;
  excerpt_he?: string;
  excerpt_en?: string;
  image: string;
  date: string;
  category: string;
  category_he?: string;
  category_en?: string;
  visibility: string[];
}

export const mockArticles: Article[] = [
  {
    id: '1',
    title: 'איך ה-AI משנה את שוק העבודה ב-2026',
    title_he: 'איך ה-AI משנה את שוק העבודה ב-2026',
    title_en: 'How AI is Changing the Job Market in 2026',
    excerpt: 'סקירה מקיפה על המקצועות שנעלמים ואלו שנולדים מחדש בעולם מבוסס בינה מלאכותית.',
    excerpt_he: 'סקירה מקיפה על המקצועות שנעלמים ואלו שנולדים מחדש בעולם מבוסס בינה מלאכותית.',
    excerpt_en: 'A comprehensive review of disappearing jobs and those being reborn in an AI-based world.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop',
    date: '05 ינואר, 2026',
    category: 'קריירה',
    category_he: 'קריירה',
    category_en: 'Career',
    visibility: ['he', 'en']
  },
  {
    id: '2',
    title: 'מדריך: בניית סוכן AI אישי הראשון שלך',
    title_he: 'מדריך: בניית סוכן AI אישי הראשון שלך',
    title_en: 'Guide: Building Your First Personal AI Agent',
    excerpt: 'צעד אחר צעד - איך להפוך את המשימות היומיומיות שלך לאוטומטיות לחלוטין.',
    excerpt_he: 'צעד אחר צעד - איך להפוך את המשימות היומיומיות שלך לאוטומטיות לחלוטין.',
    excerpt_en: 'Step by step - how to turn your daily tasks into complete automations.',
    image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd05a?q=80&w=800&auto=format&fit=crop',
    date: '02 ינואר, 2026',
    category: 'טכנולוגיה',
    category_he: 'טכנולוגיה',
    category_en: 'Technology',
    visibility: ['he', 'en']
  },
  {
    id: '3',
    title: 'אתיקה בעידן ה-AGI: מה שחייבים לדעת',
    title_he: 'אתיקה בעידן ה-AGI: מה שחייבים לדעת',
    title_en: 'Ethics in the AGI Era: What You Must Know',
    excerpt: 'האתגרים המוסריים והמשפטיים של פיתוח בינה מלאכותית חזקה.',
    excerpt_he: 'האתגרים המוסריים והמשפטיים של פיתוח בינה מלאכותית חזקה.',
    excerpt_en: 'The moral and legal challenges of developing strong AI.',
    image: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=800&auto=format&fit=crop',
    date: '28 דצמבר, 2025',
    category: 'אתיקה',
    category_he: 'אתיקה',
    category_en: 'Ethics',
    visibility: ['he', 'en']
  }
];

export const mockCourses: Course[] = [
  {
    id: 'course-a',
    title: 'תעודת מומחה AI מוסמך',
    title_he: 'תעודת מומחה AI מוסמך',
    title_en: 'Certified AI Expert Certificate',
    problemSolved: 'הכשרה מקיפה למפתחים שרוצים להוביל את עולם הבינה המלאכותית',
    problemSolved_he: 'הכשרה מקיפה למפתחים שרוצים להוביל את עולם הבינה המלאכותית',
    problemSolved_en: 'Comprehensive training for developers wanting to lead the AI world',
    duration: '120 שעות',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop',
    visibility: ['he', 'en'],
    config: {
      hasPreTest: true,
      minPreTestScore: 80,
      isPaid: true,
      price: 2490,
      hasExam: true,
      hasCertificate: true,
      hasAIModel: true,
      enableAI: true,
      enableLessonQA: true,
      isLocked: true,
      courseType: 'full_course',
      category: 'certificate',
      agent_id_he: 'agent-he-123',
      agent_id_en: 'agent-en-123'
    },
    preTest: [
      {
        id: 'q1',
        question: 'מהו היתרון המרכזי של מודלי שפה גדולים (LLM)?',
        question_he: 'מהו היתרון המרכזי של מודלי שפה גדולים (LLM)?',
        question_en: 'What is the main advantage of Large Language Models (LLMs)?',
        options: ['מהירות חישוב', 'הבנת הקשר וגמישות', 'צריכת זיכרון נמוכה', 'פשטות המודל'],
        options_he: ['מהירות חישוב', 'הבנת הקשר וגמישות', 'צריכת זיכרון נמוכה', 'פשטות המודל'],
        options_en: ['Calculation speed', 'Context understanding and flexibility', 'Low memory consumption', 'Model simplicity'],
        correctAnswer: 1
      }
    ],
    modules: [
      {
        id: 'm1',
        title: 'יסודות ומבנה מודלים',
        title_he: 'יסודות ומבנה מודלים',
        title_en: 'Foundations and Model Structure',
        lessons: [
          {
            id: 'l1',
            title: 'ארכיטקטורת Transformer',
            title_he: 'ארכיטקטורת Transformer',
            title_en: 'Transformer Architecture',
            duration: '45 דק׳',
            completed: false,
            content: 'צלילה עמוקה למבנה ה-Transformer ואיך הוא שינה את עולם ה-NLP.',
            content_he: 'צלילה עמוקה למבנה ה-Transformer ואיך הוא שינה את עולם ה-NLP.',
            content_en: 'A deep dive into the Transformer structure and how it changed the NLP world.',
            quiz: [
              {
                id: 'lq1',
                question: 'איזה מנגנון הוא לב ה-Transformer?',
                question_he: 'איזה מנגנון הוא לב ה-Transformer?',
                question_en: 'Which mechanism is at the heart of the Transformer?',
                options: ['Backpropagation', 'Self-Attention', 'Convolution', 'Recurrence'],
                options_he: ['Backpropagation', 'Self-Attention', 'Convolution', 'Recurrence'],
                options_en: ['Backpropagation', 'Self-Attention', 'Convolution', 'Recurrence'],
                correctAnswer: 1
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'course-b',
    title: 'AI לניהול זמן מזורז',
    title_he: 'AI לניהול זמן מזורז',
    title_en: 'Accelerated AI for Time Management',
    problemSolved: 'כלים פרקטיים לשיפור הפרודוקטיביות תוך שבוע אחד בלבד',
    problemSolved_he: 'כלים פרקטיים לשיפור הפרודוקטיביות תוך שבוע אחד בלבד',
    problemSolved_en: 'Practical tools to improve productivity within just one week',
    duration: '5 שעות',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop',
    visibility: ['he'],
    config: {
      hasPreTest: false,
      isPaid: true,
      price: 299,
      hasExam: false,
      hasCertificate: true,
      hasAIModel: false,
      enableAI: false,
      enableLessonQA: false,
      isLocked: false,
      courseType: 'full_course',
      category: 'fast_track'
    },
    modules: []
  },
  {
    id: 'course-c',
    title: 'עוזר אישי חכם - AI Assistant',
    title_he: 'עוזר אישי חכם - AI Assistant',
    title_en: 'Smart AI Assistant',
    problemSolved: 'בניית סוכן אישי שחוסך לך שעות של עבודה סיזיפית בכל יום',
    problemSolved_he: 'בניית סוכן אישי שחוסך לך שעות של עבודה סיזיפית בכל יום',
    problemSolved_en: 'Building a personal agent that saves you hours of tedious work every day',
    duration: '15 שעות',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
    visibility: ['he', 'en'],
    config: {
      hasPreTest: false,
      isPaid: true,
      price: 450,
      hasExam: false,
      hasCertificate: true,
      hasAIModel: true,
      enableAI: true,
      enableLessonQA: true,
      isLocked: false,
      courseType: 'full_course',
      category: 'personal_ai',
      agent_id_he: 'agent-he-789',
      agent_id_en: 'agent-en-789'
    },
    modules: []
  },
  {
    id: 'course-d',
    title: 'אוטומציות AI לעסקים',
    title_he: 'אוטומציות AI לעסקים',
    title_en: 'AI Automations for Business',
    problemSolved: 'מקסום רווחים והתייעלות עסקית באמצעות סוכני AI אוטונומיים',
    problemSolved_he: 'מקסום רווחים והתייעלות עסקית באמצעות סוכני AI אוטונומיים',
    problemSolved_en: 'Maximizing profits and business efficiency through autonomous AI agents',
    duration: '40 שעות',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
    visibility: ['he', 'en'],
    config: {
      hasPreTest: true,
      minPreTestScore: 70,
      isPaid: true,
      price: 1800,
      hasExam: true,
      hasCertificate: true,
      hasAIModel: true,
      enableAI: true,
      enableLessonQA: true,
      isLocked: true,
      courseType: 'full_course',
      category: 'business_ai',
      agent_id_he: 'agent-he-456',
      agent_id_en: 'agent-en-456'
    },
    preTest: [],
    modules: []
  }
];
