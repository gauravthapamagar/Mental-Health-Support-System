import { Quiz } from '../types';

export const quizzes: Quiz[] = [
  {
    id: 'anxiety-assessment',
    title: 'Anxiety Assessment (GAD-7)',
    description: 'Evaluate your anxiety levels over the past two weeks',
    category: 'anxiety',
    icon: '😰',
    questions: [
      {
        id: 'q1',
        question: 'Feeling nervous, anxious, or on edge',
        category: 'anxiety',
        options: [
          { text: 'Not at all', score: 0, value: 'not_at_all' },
          { text: 'Several days', score: 1, value: 'several_days' },
          { text: 'More than half the days', score: 2, value: 'more_than_half' },
          { text: 'Nearly every day', score: 3, value: 'nearly_every_day' }
        ]
      },
      {
        id: 'q2',
        question: 'Not being able to stop or control worrying',
        category: 'anxiety',
        options: [
          { text: 'Not at all', score: 0, value: 'not_at_all' },
          { text: 'Several days', score: 1, value: 'several_days' },
          { text: 'More than half the days', score: 2, value: 'more_than_half' },
          { text: 'Nearly every day', score: 3, value: 'nearly_every_day' }
        ]
      },
      {
        id: 'q3',
        question: 'Worrying too much about different things',
        category: 'anxiety',
        options: [
          { text: 'Not at all', score: 0, value: 'not_at_all' },
          { text: 'Several days', score: 1, value: 'several_days' },
          { text: 'More than half the days', score: 2, value: 'more_than_half' },
          { text: 'Nearly every day', score: 3, value: 'nearly_every_day' }
        ]
      },
      {
        id: 'q4',
        question: 'Trouble relaxing',
        category: 'anxiety',
        options: [
          { text: 'Not at all', score: 0, value: 'not_at_all' },
          { text: 'Several days', score: 1, value: 'several_days' },
          { text: 'More than half the days', score: 2, value: 'more_than_half' },
          { text: 'Nearly every day', score: 3, value: 'nearly_every_day' }
        ]
      },
      {
        id: 'q5',
        question: 'Being so restless that it\'s hard to sit still',
        category: 'anxiety',
        options: [
          { text: 'Not at all', score: 0, value: 'not_at_all' },
          { text: 'Several days', score: 1, value: 'several_days' },
          { text: 'More than half the days', score: 2, value: 'more_than_half' },
          { text: 'Nearly every day', score: 3, value: 'nearly_every_day' }
        ]
      },
      {
        id: 'q6',
        question: 'Becoming easily annoyed or irritable',
        category: 'anxiety',
        options: [
          { text: 'Not at all', score: 0, value: 'not_at_all' },
          { text: 'Several days', score: 1, value: 'several_days' },
          { text: 'More than half the days', score: 2, value: 'more_than_half' },
          { text: 'Nearly every day', score: 3, value: 'nearly_every_day' }
        ]
      },
      {
        id: 'q7',
        question: 'Feeling afraid as if something awful might happen',
        category: 'anxiety',
        options: [
          { text: 'Not at all', score: 0, value: 'not_at_all' },
          { text: 'Several days', score: 1, value: 'several_days' },
          { text: 'More than half the days', score: 2, value: 'more_than_half' },
          { text: 'Nearly every day', score: 3, value: 'nearly_every_day' }
        ]
      }
    ],
    scoringGuide: {
      ranges: [
        {
          min: 0,
          max: 4,
          level: 'minimal',
          description: 'Minimal anxiety. Your anxiety levels appear to be within a normal range.',
          color: '#10b981'
        },
        {
          min: 5,
          max: 9,
          level: 'mild',
          description: 'Mild anxiety. You may benefit from relaxation techniques and stress management.',
          color: '#fbbf24'
        },
        {
          min: 10,
          max: 14,
          level: 'moderate',
          description: 'Moderate anxiety. Consider speaking with a mental health professional.',
          color: '#f97316'
        },
        {
          min: 15,
          max: 21,
          level: 'severe',
          description: 'Severe anxiety. We strongly recommend consulting with a therapist.',
          color: '#ef4444'
        }
      ]
    }
  },
  {
    id: 'depression-screening',
    title: 'Depression Screening (PHQ-9)',
    description: 'Assess your mood and depression symptoms',
    category: 'depression',
    icon: '😔',
    questions: [
      {
        id: 'q1',
        question: 'Little interest or pleasure in doing things',
        category: 'depression',
        options: [
          { text: 'Not at all', score: 0, value: 'not_at_all' },
          { text: 'Several days', score: 1, value: 'several_days' },
          { text: 'More than half the days', score: 2, value: 'more_than_half' },
          { text: 'Nearly every day', score: 3, value: 'nearly_every_day' }
        ]
      },
      {
        id: 'q2',
        question: 'Feeling down, depressed, or hopeless',
        category: 'depression',
        options: [
          { text: 'Not at all', score: 0, value: 'not_at_all' },
          { text: 'Several days', score: 1, value: 'several_days' },
          { text: 'More than half the days', score: 2, value: 'more_than_half' },
          { text: 'Nearly every day', score: 3, value: 'nearly_every_day' }
        ]
      },
      {
        id: 'q3',
        question: 'Trouble falling or staying asleep, or sleeping too much',
        category: 'depression',
        options: [
          { text: 'Not at all', score: 0, value: 'not_at_all' },
          { text: 'Several days', score: 1, value: 'several_days' },
          { text: 'More than half the days', score: 2, value: 'more_than_half' },
          { text: 'Nearly every day', score: 3, value: 'nearly_every_day' }
        ]
      },
      {
        id: 'q4',
        question: 'Feeling tired or having little energy',
        category: 'depression',
        options: [
          { text: 'Not at all', score: 0, value: 'not_at_all' },
          { text: 'Several days', score: 1, value: 'several_days' },
          { text: 'More than half the days', score: 2, value: 'more_than_half' },
          { text: 'Nearly every day', score: 3, value: 'nearly_every_day' }
        ]
      },
      {
        id: 'q5',
        question: 'Poor appetite or overeating',
        category: 'depression',
        options: [
          { text: 'Not at all', score: 0, value: 'not_at_all' },
          { text: 'Several days', score: 1, value: 'several_days' },
          { text: 'More than half the days', score: 2, value: 'more_than_half' },
          { text: 'Nearly every day', score: 3, value: 'nearly_every_day' }
        ]
      },
      {
        id: 'q6',
        question: 'Feeling bad about yourself or that you are a failure',
        category: 'depression',
        options: [
          { text: 'Not at all', score: 0, value: 'not_at_all' },
          { text: 'Several days', score: 1, value: 'several_days' },
          { text: 'More than half the days', score: 2, value: 'more_than_half' },
          { text: 'Nearly every day', score: 3, value: 'nearly_every_day' }
        ]
      },
      {
        id: 'q7',
        question: 'Trouble concentrating on things',
        category: 'depression',
        options: [
          { text: 'Not at all', score: 0, value: 'not_at_all' },
          { text: 'Several days', score: 1, value: 'several_days' },
          { text: 'More than half the days', score: 2, value: 'more_than_half' },
          { text: 'Nearly every day', score: 3, value: 'nearly_every_day' }
        ]
      },
      {
        id: 'q8',
        question: 'Moving or speaking slowly, or being fidgety/restless',
        category: 'depression',
        options: [
          { text: 'Not at all', score: 0, value: 'not_at_all' },
          { text: 'Several days', score: 1, value: 'several_days' },
          { text: 'More than half the days', score: 2, value: 'more_than_half' },
          { text: 'Nearly every day', score: 3, value: 'nearly_every_day' }
        ]
      },
      {
        id: 'q9',
        question: 'Thoughts that you would be better off dead',
        category: 'depression',
        options: [
          { text: 'Not at all', score: 0, value: 'not_at_all' },
          { text: 'Several days', score: 1, value: 'several_days' },
          { text: 'More than half the days', score: 2, value: 'more_than_half' },
          { text: 'Nearly every day', score: 3, value: 'nearly_every_day' }
        ]
      }
    ],
    scoringGuide: {
      ranges: [
        {
          min: 0,
          max: 4,
          level: 'minimal',
          description: 'Minimal depression. Your mood appears to be healthy.',
          color: '#10b981'
        },
        {
          min: 5,
          max: 9,
          level: 'mild',
          description: 'Mild depression. Self-care and monitoring recommended.',
          color: '#fbbf24'
        },
        {
          min: 10,
          max: 14,
          level: 'moderate',
          description: 'Moderate depression. Professional support is recommended.',
          color: '#f97316'
        },
        {
          min: 15,
          max: 27,
          level: 'severe',
          description: 'Severe depression. Please seek professional help immediately.',
          color: '#ef4444'
        }
      ]
    }
  },
  {
    id: 'stress-assessment',
    title: 'Stress Level Assessment',
    description: 'Evaluate your current stress levels',
    category: 'stress',
    icon: '😫',
    questions: [
      {
        id: 'q1',
        question: 'How often have you felt overwhelmed by your responsibilities?',
        category: 'stress',
        options: [
          { text: 'Never', score: 0, value: 'never' },
          { text: 'Rarely', score: 1, value: 'rarely' },
          { text: 'Sometimes', score: 2, value: 'sometimes' },
          { text: 'Often', score: 3, value: 'often' },
          { text: 'Always', score: 4, value: 'always' }
        ]
      },
      {
        id: 'q2',
        question: 'How often do you experience physical symptoms of stress (headaches, tension)?',
        category: 'stress',
        options: [
          { text: 'Never', score: 0, value: 'never' },
          { text: 'Rarely', score: 1, value: 'rarely' },
          { text: 'Sometimes', score: 2, value: 'sometimes' },
          { text: 'Often', score: 3, value: 'often' },
          { text: 'Always', score: 4, value: 'always' }
        ]
      },
      {
        id: 'q3',
        question: 'How difficult is it for you to switch off from work/studies?',
        category: 'stress',
        options: [
          { text: 'Very easy', score: 0, value: 'very_easy' },
          { text: 'Easy', score: 1, value: 'easy' },
          { text: 'Neutral', score: 2, value: 'neutral' },
          { text: 'Difficult', score: 3, value: 'difficult' },
          { text: 'Very difficult', score: 4, value: 'very_difficult' }
        ]
      },
      {
        id: 'q4',
        question: 'How often do you feel like you have too much to do?',
        category: 'stress',
        options: [
          { text: 'Never', score: 0, value: 'never' },
          { text: 'Rarely', score: 1, value: 'rarely' },
          { text: 'Sometimes', score: 2, value: 'sometimes' },
          { text: 'Often', score: 3, value: 'often' },
          { text: 'Always', score: 4, value: 'always' }
        ]
      },
      {
        id: 'q5',
        question: 'How would you rate your current stress level?',
        category: 'stress',
        options: [
          { text: 'Very low', score: 0, value: 'very_low' },
          { text: 'Low', score: 1, value: 'low' },
          { text: 'Moderate', score: 2, value: 'moderate' },
          { text: 'High', score: 3, value: 'high' },
          { text: 'Very high', score: 4, value: 'very_high' }
        ]
      }
    ],
    scoringGuide: {
      ranges: [
        {
          min: 0,
          max: 5,
          level: 'minimal',
          description: 'Low stress. You seem to be managing well.',
          color: '#10b981'
        },
        {
          min: 6,
          max: 10,
          level: 'mild',
          description: 'Moderate stress. Consider stress management techniques.',
          color: '#fbbf24'
        },
        {
          min: 11,
          max: 15,
          level: 'moderate',
          description: 'High stress. It\'s important to prioritize self-care.',
          color: '#f97316'
        },
        {
          min: 16,
          max: 20,
          level: 'severe',
          description: 'Very high stress. Please seek support from a professional.',
          color: '#ef4444'
        }
      ]
    }
  },
  {
    id: 'sleep-quality',
    title: 'Sleep Quality Assessment',
    description: 'Evaluate your sleep patterns and quality',
    category: 'sleep',
    icon: '😴',
    questions: [
      {
        id: 'q1',
        question: 'How would you rate your overall sleep quality?',
        category: 'sleep',
        options: [
          { text: 'Excellent', score: 0, value: 'excellent' },
          { text: 'Good', score: 1, value: 'good' },
          { text: 'Fair', score: 2, value: 'fair' },
          { text: 'Poor', score: 3, value: 'poor' }
        ]
      },
      {
        id: 'q2',
        question: 'How long does it typically take you to fall asleep?',
        category: 'sleep',
        options: [
          { text: 'Less than 15 minutes', score: 0, value: 'less_15' },
          { text: '15-30 minutes', score: 1, value: '15_30' },
          { text: '30-60 minutes', score: 2, value: '30_60' },
          { text: 'More than 60 minutes', score: 3, value: 'more_60' }
        ]
      },
      {
        id: 'q3',
        question: 'How often do you wake up during the night?',
        category: 'sleep',
        options: [
          { text: 'Never', score: 0, value: 'never' },
          { text: 'Once', score: 1, value: 'once' },
          { text: '2-3 times', score: 2, value: '2_3_times' },
          { text: 'More than 3 times', score: 3, value: 'more_3' }
        ]
      },
      {
        id: 'q4',
        question: 'Do you feel refreshed when you wake up?',
        category: 'sleep',
        options: [
          { text: 'Always', score: 0, value: 'always' },
          { text: 'Usually', score: 1, value: 'usually' },
          { text: 'Sometimes', score: 2, value: 'sometimes' },
          { text: 'Never', score: 3, value: 'never' }
        ]
      },
      {
        id: 'q5',
        question: 'How often do you have difficulty staying awake during the day?',
        category: 'sleep',
        options: [
          { text: 'Never', score: 0, value: 'never' },
          { text: 'Rarely', score: 1, value: 'rarely' },
          { text: 'Sometimes', score: 2, value: 'sometimes' },
          { text: 'Often', score: 3, value: 'often' }
        ]
      }
    ],
    scoringGuide: {
      ranges: [
        {
          min: 0,
          max: 4,
          level: 'minimal',
          description: 'Good sleep quality. You have healthy sleep patterns.',
          color: '#10b981'
        },
        {
          min: 5,
          max: 8,
          level: 'mild',
          description: 'Fair sleep quality. Consider improving sleep hygiene.',
          color: '#fbbf24'
        },
        {
          min: 9,
          max: 11,
          level: 'moderate',
          description: 'Poor sleep quality. Sleep improvement strategies recommended.',
          color: '#f97316'
        },
        {
          min: 12,
          max: 15,
          level: 'severe',
          description: 'Very poor sleep quality. Consider consulting a sleep specialist.',
          color: '#ef4444'
        }
      ]
    }
  },
  {
    id: 'wellness-check',
    title: 'Overall Wellness Check',
    description: 'Assess your general mental wellness',
    category: 'wellness',
    icon: '🌟',
    questions: [
      {
        id: 'q1',
        question: 'How satisfied are you with your life overall?',
        category: 'wellness',
        options: [
          { text: 'Very satisfied', score: 4, value: 'very_satisfied' },
          { text: 'Satisfied', score: 3, value: 'satisfied' },
          { text: 'Neutral', score: 2, value: 'neutral' },
          { text: 'Dissatisfied', score: 1, value: 'dissatisfied' },
          { text: 'Very dissatisfied', score: 0, value: 'very_dissatisfied' }
        ]
      },
      {
        id: 'q2',
        question: 'How would you rate your relationships with others?',
        category: 'wellness',
        options: [
          { text: 'Excellent', score: 4, value: 'excellent' },
          { text: 'Good', score: 3, value: 'good' },
          { text: 'Fair', score: 2, value: 'fair' },
          { text: 'Poor', score: 1, value: 'poor' },
          { text: 'Very poor', score: 0, value: 'very_poor' }
        ]
      },
      {
        id: 'q3',
        question: 'How often do you engage in activities you enjoy?',
        category: 'wellness',
        options: [
          { text: 'Daily', score: 4, value: 'daily' },
          { text: 'Several times a week', score: 3, value: 'several_week' },
          { text: 'Once a week', score: 2, value: 'once_week' },
          { text: 'Rarely', score: 1, value: 'rarely' },
          { text: 'Never', score: 0, value: 'never' }
        ]
      },
      {
        id: 'q4',
        question: 'How well do you feel you\'re coping with daily challenges?',
        category: 'wellness',
        options: [
          { text: 'Very well', score: 4, value: 'very_well' },
          { text: 'Well', score: 3, value: 'well' },
          { text: 'Moderately', score: 2, value: 'moderately' },
          { text: 'Poorly', score: 1, value: 'poorly' },
          { text: 'Very poorly', score: 0, value: 'very_poorly' }
        ]
      },
      {
        id: 'q5',
        question: 'Do you feel you have a sense of purpose?',
        category: 'wellness',
        options: [
          { text: 'Strongly agree', score: 4, value: 'strongly_agree' },
          { text: 'Agree', score: 3, value: 'agree' },
          { text: 'Neutral', score: 2, value: 'neutral' },
          { text: 'Disagree', score: 1, value: 'disagree' },
          { text: 'Strongly disagree', score: 0, value: 'strongly_disagree' }
        ]
      }
    ],
    scoringGuide: {
      ranges: [
        {
          min: 16,
          max: 20,
          level: 'minimal',
          description: 'Excellent wellness. You\'re thriving!',
          color: '#10b981'
        },
        {
          min: 11,
          max: 15,
          level: 'mild',
          description: 'Good wellness. Keep up the healthy habits.',
          color: '#fbbf24'
        },
        {
          min: 6,
          max: 10,
          level: 'moderate',
          description: 'Fair wellness. Consider focusing on self-improvement.',
          color: '#f97316'
        },
        {
          min: 0,
          max: 5,
          level: 'severe',
          description: 'Low wellness. Professional support may be beneficial.',
          color: '#ef4444'
        }
      ]
    }
  }
];