import { FlashcardCategory } from '../types';

export const flashcardCategories: FlashcardCategory[] = [
  {
    id: 'cbt-basics',
    name: 'CBT Basics',
    description: 'Learn the fundamentals of Cognitive Behavioral Therapy',
    icon: '🧠',
    color: '#3b82f6',
    cards: [
      {
        id: 'cbt-1',
        front: 'What is Cognitive Behavioral Therapy (CBT)?',
        back: 'CBT is a type of psychotherapy that helps you identify and change negative thought patterns and behaviors. It focuses on the connection between thoughts, feelings, and actions.',
        category: 'cbt-basics'
      },
      {
        id: 'cbt-2',
        front: 'What is the Cognitive Triangle?',
        back: 'The Cognitive Triangle illustrates how thoughts, feelings, and behaviors are interconnected. Changing one element can positively affect the others.',
        category: 'cbt-basics'
      },
      {
        id: 'cbt-3',
        front: 'What are Automatic Thoughts?',
        back: 'Automatic thoughts are instant, unconscious thoughts that pop into your mind in response to situations. They can be positive, negative, or neutral.',
        category: 'cbt-basics'
      },
      {
        id: 'cbt-4',
        front: 'What is Cognitive Distortion?',
        back: 'Cognitive distortions are irrational or exaggerated thought patterns that can reinforce negative thinking and emotions. Examples include all-or-nothing thinking and catastrophizing.',
        category: 'cbt-basics'
      },
      {
        id: 'cbt-5',
        front: 'What is Thought Challenging?',
        back: 'Thought challenging is a CBT technique where you examine the evidence for and against negative thoughts to develop more balanced, realistic perspectives.',
        category: 'cbt-basics'
      }
    ]
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness & Meditation',
    description: 'Practice mindful awareness and meditation techniques',
    icon: '🧘',
    color: '#8b5cf6',
    cards: [
      {
        id: 'mind-1',
        front: 'What is Mindfulness?',
        back: 'Mindfulness is the practice of being fully present and engaged in the current moment, aware of your thoughts and feelings without judgment.',
        category: 'mindfulness'
      },
      {
        id: 'mind-2',
        front: 'What is the 5-4-3-2-1 Grounding Technique?',
        back: 'A sensory awareness exercise: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste. It helps anchor you to the present moment.',
        category: 'mindfulness'
      },
      {
        id: 'mind-3',
        front: 'What is Body Scan Meditation?',
        back: 'A practice where you systematically focus attention on different parts of your body, noticing sensations without judgment. It promotes relaxation and body awareness.',
        category: 'mindfulness'
      },
      {
        id: 'mind-4',
        front: 'What is Loving-Kindness Meditation?',
        back: 'A meditation practice that involves directing positive thoughts and well-wishes toward yourself and others, cultivating compassion and empathy.',
        category: 'mindfulness'
      },
      {
        id: 'mind-5',
        front: 'What is Mindful Breathing?',
        back: 'Focusing your attention on your breath - the sensation of air entering and leaving your body. When your mind wanders, gently bring it back to your breath.',
        category: 'mindfulness'
      },
      {
        id: 'mind-6',
        front: 'What does "Non-Judgment" mean in mindfulness?',
        back: 'Observing your thoughts, feelings, and experiences without labeling them as good or bad. Simply noticing them as they are.',
        category: 'mindfulness'
      }
    ]
  },
  {
    id: 'anxiety-management',
    name: 'Anxiety Management',
    description: 'Strategies for managing and reducing anxiety',
    icon: '😌',
    color: '#10b981',
    cards: [
      {
        id: 'anx-1',
        front: 'What is the 4-7-8 Breathing Technique?',
        back: 'Breathe in for 4 counts, hold for 7 counts, exhale for 8 counts. This activates your parasympathetic nervous system, promoting relaxation.',
        category: 'anxiety-management'
      },
      {
        id: 'anx-2',
        front: 'What is Progressive Muscle Relaxation?',
        back: 'A technique where you systematically tense and then relax different muscle groups in your body, helping to release physical tension and reduce anxiety.',
        category: 'anxiety-management'
      },
      {
        id: 'anx-3',
        front: 'What is Exposure Therapy?',
        back: 'A therapeutic approach where you gradually face feared situations in a safe, controlled way to reduce anxiety over time through habituation.',
        category: 'anxiety-management'
      },
      {
        id: 'anx-4',
        front: 'What is the "Worry Time" Technique?',
        back: 'Setting aside a specific 15-30 minute period each day to address worries, helping to contain anxious thoughts rather than letting them consume your day.',
        category: 'anxiety-management'
      },
      {
        id: 'anx-5',
        front: 'What is Catastrophizing?',
        back: 'A thinking pattern where you imagine the worst possible outcome. Challenge it by asking: "What\'s the most likely outcome?" and "How would I cope if it happened?"',
        category: 'anxiety-management'
      },
      {
        id: 'anx-6',
        front: 'What is the AWARE Technique for Panic?',
        back: 'Accept the anxiety, Watch it without judgment, Act normally, Repeat the steps, Expect the best. A method to manage panic attacks.',
        category: 'anxiety-management'
      }
    ]
  },
  {
    id: 'depression-coping',
    name: 'Depression Coping Skills',
    description: 'Tools and techniques for managing depression',
    icon: '🌈',
    color: '#ec4899',
    cards: [
      {
        id: 'dep-1',
        front: 'What is Behavioral Activation?',
        back: 'A therapeutic approach that involves scheduling and engaging in positive activities, even when you don\'t feel like it, to improve mood and break the cycle of depression.',
        category: 'depression-coping'
      },
      {
        id: 'dep-2',
        front: 'What is the SMART Goal Framework?',
        back: 'Specific, Measurable, Achievable, Relevant, Time-bound goals. Breaking larger tasks into smaller, manageable steps helps combat overwhelm.',
        category: 'depression-coping'
      },
      {
        id: 'dep-3',
        front: 'What is Gratitude Practice?',
        back: 'Regularly identifying and appreciating positive aspects of life, such as writing down 3 things you\'re grateful for each day. It can help shift focus from negative to positive.',
        category: 'depression-coping'
      },
      {
        id: 'dep-4',
        front: 'What is the ABC Model?',
        back: 'Activating event, Beliefs about the event, Consequences (emotions/behaviors). Understanding this connection helps identify and change unhelpful thought patterns.',
        category: 'depression-coping'
      },
      {
        id: 'dep-5',
        front: 'What is Self-Compassion?',
        back: 'Treating yourself with the same kindness and understanding you\'d offer a good friend. It involves being gentle with yourself during difficult times.',
        category: 'depression-coping'
      },
      {
        id: 'dep-6',
        front: 'What is Social Connection?',
        back: 'Maintaining relationships and reaching out to others, even when you don\'t feel like it. Social support is crucial for managing depression.',
        category: 'depression-coping'
      }
    ]
  },
  {
    id: 'stress-reduction',
    name: 'Stress Reduction',
    description: 'Effective techniques for managing daily stress',
    icon: '🕊️',
    color: '#f59e0b',
    cards: [
      {
        id: 'stress-1',
        front: 'What is the Pomodoro Technique?',
        back: 'Work for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer 15-30 minute break. This helps maintain focus and prevents burnout.',
        category: 'stress-reduction'
      },
      {
        id: 'stress-2',
        front: 'What is Time Blocking?',
        back: 'Scheduling specific blocks of time for different tasks or activities. This helps manage your day, reduce overwhelm, and create boundaries.',
        category: 'stress-reduction'
      },
      {
        id: 'stress-3',
        front: 'What is the Eisenhower Matrix?',
        back: 'A prioritization tool that categorizes tasks into: Urgent & Important, Important but Not Urgent, Urgent but Not Important, Neither. Helps focus on what truly matters.',
        category: 'stress-reduction'
      },
      {
        id: 'stress-4',
        front: 'What is "Box Breathing"?',
        back: 'Breathe in for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat. Used by Navy SEALs to manage stress and maintain calm in high-pressure situations.',
        category: 'stress-reduction'
      },
      {
        id: 'stress-5',
        front: 'What is the "Two-Minute Rule"?',
        back: 'If a task takes less than 2 minutes, do it immediately. This prevents small tasks from piling up and becoming overwhelming.',
        category: 'stress-reduction'
      },
      {
        id: 'stress-6',
        front: 'What is Digital Detox?',
        back: 'Taking regular breaks from digital devices and social media to reduce information overload and mental clutter. Even short breaks can be beneficial.',
        category: 'stress-reduction'
      }
    ]
  },
  {
    id: 'sleep-hygiene',
    name: 'Sleep Hygiene',
    description: 'Improve your sleep quality with healthy habits',
    icon: '🌙',
    color: '#6366f1',
    cards: [
      {
        id: 'sleep-1',
        front: 'What is the ideal sleep environment?',
        back: 'Cool (60-67°F/15-19°C), dark, and quiet. Use blackout curtains, white noise if needed, and remove electronic devices.',
        category: 'sleep-hygiene'
      },
      {
        id: 'sleep-2',
        front: 'What is the 3-2-1 Sleep Rule?',
        back: 'Stop eating 3 hours before bed, stop working 2 hours before bed, stop using screens 1 hour before bed. This helps your body prepare for sleep.',
        category: 'sleep-hygiene'
      },
      {
        id: 'sleep-3',
        front: 'What is a Sleep Schedule?',
        back: 'Going to bed and waking up at the same time every day (even weekends) helps regulate your body\'s internal clock and improves sleep quality.',
        category: 'sleep-hygiene'
      },
      {
        id: 'sleep-4',
        front: 'What is the 20-Minute Rule?',
        back: 'If you can\'t fall asleep after 20 minutes, get up and do a relaxing activity until you feel sleepy. This prevents associating your bed with wakefulness.',
        category: 'sleep-hygiene'
      },
      {
        id: 'sleep-5',
        front: 'What is Caffeine\'s Impact on Sleep?',
        back: 'Caffeine has a half-life of 5-6 hours. Avoid caffeine at least 6-8 hours before bedtime to prevent sleep disruption.',
        category: 'sleep-hygiene'
      },
      {
        id: 'sleep-6',
        front: 'What is a Wind-Down Routine?',
        back: 'A consistent pre-sleep routine (reading, gentle stretching, meditation) signals to your body it\'s time to sleep and promotes better rest.',
        category: 'sleep-hygiene'
      }
    ]
  },
  {
    id: 'emotional-regulation',
    name: 'Emotional Regulation',
    description: 'Understand and manage your emotions effectively',
    icon: '❤️',
    color: '#ef4444',
    cards: [
      {
        id: 'emo-1',
        front: 'What is RAIN Technique?',
        back: 'Recognize the emotion, Allow it to be present, Investigate with curiosity, Nurture with self-compassion. A mindful approach to difficult emotions.',
        category: 'emotional-regulation'
      },
      {
        id: 'emo-2',
        front: 'What is Emotion Labeling?',
        back: 'Putting your feelings into words (e.g., "I feel anxious" instead of "I feel bad"). Research shows labeling emotions can reduce their intensity.',
        category: 'emotional-regulation'
      },
      {
        id: 'emo-3',
        front: 'What is the STOP Skill?',
        back: 'Stop, Take a step back, Observe, Proceed mindfully. A DBT technique for pausing before reacting impulsively to strong emotions.',
        category: 'emotional-regulation'
      },
      {
        id: 'emo-4',
        front: 'What is Opposite Action?',
        back: 'A DBT skill where you act opposite to your emotional urge when the emotion doesn\'t fit the facts (e.g., approaching instead of avoiding when anxious).',
        category: 'emotional-regulation'
      },
      {
        id: 'emo-5',
        front: 'What is the Window of Tolerance?',
        back: 'The optimal zone where you can function effectively. Outside this window, you may feel hyper-aroused (anxious) or hypo-aroused (numb/shut down).',
        category: 'emotional-regulation'
      },
      {
        id: 'emo-6',
        front: 'What is Emotional Validation?',
        back: 'Acknowledging that your feelings make sense given your circumstances, even if others might feel differently. All emotions are valid.',
        category: 'emotional-regulation'
      }
    ]
  }
];