import { CopingStrategy } from '../types';

export const copingStrategies: CopingStrategy[] = [
  // Anxiety strategies
  {
    id: 'anxiety-breathing',
    title: '4-7-8 Breathing Exercise',
    description: 'A calming breathing technique to reduce anxiety quickly',
    category: 'anxiety',
    applicableFor: ['mild', 'moderate', 'severe'],
    steps: [
      'Find a comfortable seated position',
      'Close your eyes and relax your shoulders',
      'Breathe in through your nose for 4 counts',
      'Hold your breath for 7 counts',
      'Exhale slowly through your mouth for 8 counts',
      'Repeat this cycle 4 times',
      'Notice how your body feels more relaxed'
    ]
  },
  {
    id: 'anxiety-grounding',
    title: '5-4-3-2-1 Grounding Technique',
    description: 'Use your senses to anchor yourself in the present moment',
    category: 'anxiety',
    applicableFor: ['mild', 'moderate', 'severe'],
    steps: [
      'Acknowledge 5 things you can SEE around you',
      'Acknowledge 4 things you can TOUCH',
      'Acknowledge 3 things you can HEAR',
      'Acknowledge 2 things you can SMELL',
      'Acknowledge 1 thing you can TASTE',
      'Take a deep breath and notice how you feel more grounded'
    ]
  },
  {
    id: 'anxiety-progressive-relaxation',
    title: 'Progressive Muscle Relaxation',
    description: 'Release physical tension associated with anxiety',
    category: 'anxiety',
    applicableFor: ['mild', 'moderate'],
    steps: [
      'Find a quiet, comfortable place to sit or lie down',
      'Starting with your toes, tense the muscles for 5 seconds',
      'Release and notice the feeling of relaxation for 10 seconds',
      'Move up to your calves, thighs, abdomen, chest, arms, and face',
      'Tense and release each muscle group',
      'Focus on the difference between tension and relaxation',
      'Finish by taking 3 deep breaths'
    ]
  },
  {
    id: 'anxiety-thought-challenging',
    title: 'Challenging Anxious Thoughts',
    description: 'Question and reframe anxiety-producing thoughts',
    category: 'anxiety',
    applicableFor: ['mild', 'moderate'],
    steps: [
      'Identify the anxious thought (write it down)',
      'Ask: "What evidence supports this thought?"',
      'Ask: "What evidence contradicts this thought?"',
      'Ask: "What would I tell a friend thinking this?"',
      'Create a more balanced, realistic thought',
      'Notice how this affects your anxiety level',
      'Practice this regularly when anxious thoughts arise'
    ]
  },

  // Depression strategies
  {
    id: 'depression-behavioral-activation',
    title: 'Behavioral Activation',
    description: 'Engage in positive activities to improve mood',
    category: 'depression',
    applicableFor: ['mild', 'moderate', 'severe'],
    steps: [
      'Make a list of activities you used to enjoy',
      'Rate each activity\'s difficulty (1-10)',
      'Choose one easy activity (rating 1-3) to start',
      'Schedule it for a specific time today or tomorrow',
      'Do the activity even if you don\'t feel like it',
      'Notice any mood changes, even small ones',
      'Gradually add more activities each week'
    ]
  },
  {
    id: 'depression-gratitude',
    title: 'Daily Gratitude Practice',
    description: 'Shift focus toward positive aspects of life',
    category: 'depression',
    applicableFor: ['minimal', 'mild', 'moderate'],
    steps: [
      'Each evening, find a quiet moment',
      'Write down 3 specific things you\'re grateful for',
      'They can be small (good coffee, sunshine, a text from a friend)',
      'Write why each one matters to you',
      'Reflect on the positive feeling this brings',
      'Keep a gratitude journal to track over time',
      'Review past entries when feeling down'
    ]
  },
  {
    id: 'depression-self-compassion',
    title: 'Self-Compassion Break',
    description: 'Practice kindness toward yourself during difficult moments',
    category: 'depression',
    applicableFor: ['mild', 'moderate', 'severe'],
    steps: [
      'Notice when you\'re being self-critical',
      'Place your hand over your heart',
      'Say: "This is a moment of suffering"',
      'Say: "Suffering is a part of life - I\'m not alone"',
      'Say: "May I be kind to myself in this moment"',
      'Ask: "What do I need right now?"',
      'Offer yourself what you need (rest, support, encouragement)'
    ]
  },
  {
    id: 'depression-small-wins',
    title: 'Celebrate Small Wins',
    description: 'Acknowledge and celebrate small achievements',
    category: 'depression',
    applicableFor: ['mild', 'moderate', 'severe'],
    steps: [
      'Set one very small, achievable goal for the day',
      'Examples: shower, make your bed, eat a meal, go outside',
      'Complete the goal without judging how "small" it is',
      'Consciously acknowledge your accomplishment',
      'Tell yourself: "I did that, and it matters"',
      'Write it down or tell someone supportive',
      'Build on these small wins each day'
    ]
  },

  // Stress strategies
  {
    id: 'stress-time-management',
    title: 'Priority Matrix',
    description: 'Organize tasks to reduce overwhelm',
    category: 'stress',
    applicableFor: ['mild', 'moderate', 'severe'],
    steps: [
      'List all your current tasks and commitments',
      'Create four categories: Urgent & Important, Important but Not Urgent, Urgent but Not Important, Neither',
      'Sort each task into a category',
      'Focus on Important but Not Urgent tasks to prevent future stress',
      'Delegate or eliminate tasks in the "Neither" category',
      'Schedule time blocks for your priorities',
      'Review and adjust weekly'
    ]
  },
  {
    id: 'stress-boundaries',
    title: 'Setting Healthy Boundaries',
    description: 'Learn to say no and protect your time and energy',
    category: 'stress',
    applicableFor: ['mild', 'moderate', 'severe'],
    steps: [
      'Identify areas where you feel overextended',
      'Decide what you can realistically handle',
      'Practice saying "no" to new commitments',
      'Use phrases like "I need to check my schedule" to buy time',
      'Communicate your limits clearly and kindly',
      'Don\'t over-explain or apologize excessively',
      'Stick to your boundaries even when it feels uncomfortable'
    ]
  },
  {
    id: 'stress-physical-activity',
    title: 'Movement for Stress Relief',
    description: 'Use physical activity to release stress',
    category: 'stress',
    applicableFor: ['minimal', 'mild', 'moderate'],
    steps: [
      'Choose any movement you enjoy (walking, dancing, yoga, etc.)',
      'Start with just 10-15 minutes',
      'Focus on how your body feels during movement',
      'Notice tension releasing from your muscles',
      'Don\'t worry about intensity - gentle movement helps too',
      'Make it a regular part of your routine',
      'Celebrate the stress relief you feel afterward'
    ]
  },
  {
    id: 'stress-digital-detox',
    title: 'Digital Detox Breaks',
    description: 'Reduce information overload and mental clutter',
    category: 'stress',
    applicableFor: ['minimal', 'mild', 'moderate'],
    steps: [
      'Set specific times to check email and social media',
      'Turn off non-essential notifications',
      'Take a 1-hour device-free break each day',
      'Keep devices out of the bedroom',
      'Use apps to track and limit screen time',
      'Replace scrolling with offline activities',
      'Notice improvements in your stress and focus'
    ]
  },

  // Sleep strategies
  {
    id: 'sleep-routine',
    title: 'Consistent Sleep Routine',
    description: 'Establish healthy sleep habits',
    category: 'sleep',
    applicableFor: ['minimal', 'mild', 'moderate', 'severe'],
    steps: [
      'Set a consistent bedtime and wake time (even weekends)',
      'Create a 30-60 minute wind-down routine',
      'Include calming activities (reading, gentle stretching, meditation)',
      'Avoid screens 1 hour before bed',
      'Keep your bedroom cool (60-67°F)',
      'Use blackout curtains or a sleep mask',
      'Stick to the routine for at least 2 weeks to see results'
    ]
  },
  {
    id: 'sleep-worry-time',
    title: 'Worry Time Technique',
    description: 'Prevent bedtime worries from disrupting sleep',
    category: 'sleep',
    applicableFor: ['mild', 'moderate', 'severe'],
    steps: [
      'Schedule 15 minutes earlier in the evening as "worry time"',
      'Write down all your worries and concerns',
      'For each worry, note any action you can take tomorrow',
      'When worries come up at bedtime, remind yourself you\'ll address them during tomorrow\'s worry time',
      'Practice a relaxation technique before bed',
      'Keep a notepad by your bed for intrusive thoughts',
      'Jot them down quickly and return to sleep'
    ]
  },
  {
    id: 'sleep-body-scan',
    title: 'Body Scan for Sleep',
    description: 'Use body awareness to promote relaxation and sleep',
    category: 'sleep',
    applicableFor: ['mild', 'moderate'],
    steps: [
      'Lie comfortably in bed with eyes closed',
      'Take 3 deep, slow breaths',
      'Focus attention on your toes - notice any sensations',
      'Imagine tension releasing from your toes',
      'Slowly move attention up through your body',
      'Notice and release tension in each area',
      'If your mind wanders, gently return to the body scan'
    ]
  },

  // Wellness strategies
  {
    id: 'wellness-social-connection',
    title: 'Nurture Social Connections',
    description: 'Build and maintain supportive relationships',
    category: 'wellness',
    applicableFor: ['minimal', 'mild', 'moderate'],
    steps: [
      'Reach out to one person you care about this week',
      'Schedule a phone call, video chat, or in-person meeting',
      'Be present during the conversation - put devices away',
      'Share something meaningful, not just surface-level chat',
      'Listen actively and ask questions',
      'Make this a regular practice, not a one-time thing',
      'Join groups or communities aligned with your interests'
    ]
  },
  {
    id: 'wellness-purpose',
    title: 'Discover Your Purpose',
    description: 'Connect with what gives your life meaning',
    category: 'wellness',
    applicableFor: ['minimal', 'mild', 'moderate'],
    steps: [
      'Reflect on activities that make you lose track of time',
      'Think about what you\'d do if money wasn\'t a concern',
      'Identify your core values (family, creativity, helping others, etc.)',
      'Consider causes or issues you care deeply about',
      'Write down how you could contribute to these areas',
      'Take one small action aligned with your purpose this week',
      'Regularly reassess and refine your sense of purpose'
    ]
  },
  {
    id: 'wellness-growth-mindset',
    title: 'Cultivate a Growth Mindset',
    description: 'Embrace challenges and learn from setbacks',
    category: 'wellness',
    applicableFor: ['minimal', 'mild'],
    steps: [
      'Notice when you think "I can\'t do this"',
      'Add the word "yet" - "I can\'t do this yet"',
      'View challenges as opportunities to learn',
      'Focus on effort and progress, not just outcomes',
      'When you make a mistake, ask "What can I learn?"',
      'Celebrate small improvements and persistence',
      'Surround yourself with people who encourage growth'
    ]
  },

  // General strategies applicable to all
  {
    id: 'general-mindfulness',
    title: 'Daily Mindfulness Practice',
    description: 'Develop present-moment awareness',
    category: 'general',
    applicableFor: ['minimal', 'mild', 'moderate', 'severe'],
    steps: [
      'Set aside 5-10 minutes each day',
      'Find a quiet, comfortable place to sit',
      'Close your eyes and focus on your breath',
      'Notice when your mind wanders (it will)',
      'Gently bring attention back to your breath',
      'Don\'t judge yourself for getting distracted',
      'Gradually increase the duration as you build the habit'
    ]
  },
  {
    id: 'general-journaling',
    title: 'Reflective Journaling',
    description: 'Process emotions and gain clarity through writing',
    category: 'general',
    applicableFor: ['minimal', 'mild', 'moderate'],
    steps: [
      'Set aside 10-15 minutes for journaling',
      'Write freely without censoring yourself',
      'Prompts: "Today I felt...", "I\'m grateful for...", "I\'m struggling with..."',
      'Don\'t worry about grammar or making sense',
      'Notice patterns in your thoughts and feelings over time',
      'Celebrate insights and moments of clarity',
      'Keep your journal private and judgment-free'
    ]
  },
  {
    id: 'general-professional-help',
    title: 'Seeking Professional Support',
    description: 'Know when and how to get professional help',
    category: 'general',
    applicableFor: ['moderate', 'severe'],
    steps: [
      'Acknowledge that seeking help is a sign of strength',
      'Consider therapy if symptoms persist for 2+ weeks',
      'Use our platform to match with a suitable therapist',
      'Prepare for your first session by noting your concerns',
      'Be honest and open with your therapist',
      'Give therapy time - it\'s a process, not a quick fix',
      'If urgent, call a crisis helpline (988 in the US)'
    ]
  }
];

// Helper function to get strategies based on quiz result
export function getStrategiesForResult(category: string, level: string): CopingStrategy[] {
  return copingStrategies.filter(
    strategy => 
      (strategy.category === category || strategy.category === 'general') &&
      strategy.applicableFor.includes(level)
  );
}