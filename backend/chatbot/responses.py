"""
Comprehensive rule-based response database for mental health support chatbot.
Covers anxiety, depression, stress, sleep, loneliness, and platform navigation.
Each intent has detailed, specific keywords to ensure accurate matching.
"""

RESPONSES = {
    # ========================
    # GREETING & WELCOME
    # ========================
    "greeting": {
        "keywords": ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening", "what's up", "howdy", "start"],
        "responses": [
            "Hello! I'm here to listen and support you. How are you feeling today?",
            "Hi there! Welcome to our mental health support community. What's on your mind?",
            "Hey! It's great to hear from you. What can I help you with today?",
            "Welcome! I'm here whenever you need support. What brings you here today?",
            "Hi! I'm glad you're here. How are you doing right now?",
        ]
    },

    # ========================
    # ANXIETY - DETAILED
    # ========================
    "anxiety_what_is": {
        "keywords": ["what is anxiety", "what does anxiety mean", "anxiety definition", "explain anxiety", "tell me about anxiety", "anxiety is what"],
        "responses": [
            "Anxiety is your body's natural response to stress or perceived danger. It triggers physical sensations (racing heart, shortness of breath) and mental symptoms (worry, racing thoughts). While some anxiety is normal, excessive anxiety can interfere with daily life. Our platform provides techniques to help you manage it effectively.",
            "Anxiety happens when your body perceives a threat and activates the 'fight or flight' response. Everyone experiences it differently—some feel it physically, others mentally. The good news is anxiety is highly treatable with the right strategies and support.",
        ]
    },

    "anxiety_symptoms": {
        "keywords": ["anxiety symptoms", "signs of anxiety", "how do i know if i have anxiety", "physical symptoms anxiety", "chest tightness", "racing heart", "shortness of breath", "panic feeling"],
        "responses": [
            "Common anxiety symptoms include racing heart, shortness of breath, chest tightness, sweating, trembling, dizziness, nausea, and stomach issues. Mentally, you might experience racing thoughts, difficulty concentrating, feeling overwhelmed, or a sense of impending doom. If these symptoms persist, our coping techniques and professional resources can help.",
            "Anxiety shows up differently for everyone. Some people feel physical symptoms (tension, headaches), while others experience mainly mental symptoms (worry, intrusive thoughts). You might feel restless, irritable, or unable to focus. These are all signs that anxiety management techniques would help.",
        ]
    },

    "anxiety_coping_techniques": {
        "keywords": ["anxiety coping", "anxiety techniques", "how to handle anxiety", "anxiety relief", "reduce anxiety", "manage anxiety", "deal with anxiety"],
        "responses": [
            "Effective techniques include the 5-4-3-2-1 grounding exercise: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. This brings your mind back to the present. Also try box breathing (in-4, hold-4, out-4, hold-4) and progressive muscle relaxation for quick relief.",
            "Start with breathing exercises since they work immediately: slow breaths calm your nervous system within minutes. Combine with physical activity (walking, stretching), journaling your worries, or talking to someone you trust. Regular practice makes these techniques more effective over time.",
        ]
    },

    "panic_attacks": {
        "keywords": ["panic attack", "having a panic attack", "panic disorder", "feel like dying", "heart attack anxiety", "can't breathe panic"],
        "responses": [
            "Panic attacks feel terrifying but are not dangerous—they typically peak within 10 minutes and then subside. During an attack, focus on breathing: try the 4-7-8 technique (breathe in 4, hold 7, out 8) to activate your relaxation response. Remember you're safe and it will pass.",
            "If panic attacks recur, professional support helps identify triggers and build coping skills. Our platform can connect you with therapists who specialize in panic disorder. In the moment, ground yourself by naming 5 things you see or focusing on something you can control.",
        ]
    },

    "anxiety_at_night": {
        "keywords": ["anxiety at night", "racing thoughts at night", "nighttime anxiety", "worried at night", "can't sleep because of anxiety", "insomnia from anxiety"],
        "responses": [
            "Nighttime anxiety often stems from racing thoughts. Try progressive muscle relaxation: tense and release each muscle group from your toes to head. Journaling your worries before bed helps—write them down, then consciously put them aside for tomorrow.",
            "Create a calming bedtime routine: dim lights, avoid screens 30 minutes before bed, do gentle stretching, and try guided meditation. If anxiety still strikes, get up and do a quiet activity until you feel drowsy, then return to bed.",
        ]
    },

    "social_anxiety": {
        "keywords": ["social anxiety", "afraid of people", "social situations", "meeting new people", "presentation anxiety", "fear of judgment"],
        "responses": [
            "Social anxiety is common and treatable. Start small: practice conversations with trusted people first, then gradually expand. Remember that most people are focused on themselves, not judging you. Small, repeated exposure builds confidence naturally.",
            "When facing social situations, use your breathing techniques beforehand. If social anxiety significantly impacts your life, our support team can connect you with professionals who specialize in this. You can also join our community to practice connecting with others in a supportive environment.",
        ]
    },

    # ========================
    # DEPRESSION - DETAILED
    # ========================
    "depression_what_is": {
        "keywords": ["what is depression", "depression definition", "explain depression", "tell me about depression", "how do i know if depressed"],
        "responses": [
            "Depression is more than sadness—it's a condition where you persistently feel low, hopeless, and lose interest in activities you once enjoyed. It affects sleep, appetite, energy, and concentration, and can last weeks or longer. Depression is highly treatable with support and the right strategies.",
            "Depression involves persistent low mood, loss of pleasure in activities, and difficulty functioning daily. It's not weakness or something you can 'snap out of'—it's a real condition. Reaching out for support is a sign of strength, and recovery is absolutely possible.",
        ]
    },

    "depression_symptoms": {
        "keywords": ["depression symptoms", "signs of depression", "depressed", "feel sad all the time", "lost interest in things", "no motivation", "feel empty"],
        "responses": [
            "Depression symptoms include persistent sadness, loss of interest in hobbies, changes in sleep or appetite, low energy, difficulty concentrating, feelings of worthlessness, and sometimes thoughts of death. Physical symptoms like body aches or digestive problems are common too. If these last more than 2 weeks, professional support helps.",
            "You might feel unmotivated, unable to enjoy things you used to love, withdrawn from friends, or like you're a burden. Depression also affects physical health—sleep problems, appetite changes, or chronic pain. These are all valid symptoms that respond well to proper support.",
        ]
    },

    "depression_coping": {
        "keywords": ["how to cope with depression", "depression coping", "managing depression", "overcome depression", "depression help", "dealing with depression"],
        "responses": [
            "Start with micro-goals: shower, eat one meal, or take a 10-minute walk. Small wins build momentum and prove your capability. Physical activity is powerful—even gentle movement boosts mood through endorphins. Practice self-compassion; treat yourself as you would a good friend.",
            "Break tasks into tiny steps instead of looking at the whole picture. Maintain a loose routine to give your day structure. Connect with one person, even briefly. Our mood-tracking feature helps you see patterns and celebrate progress, no matter how small.",
        ]
    },

    "worthlessness_guilt": {
        "keywords": ["i feel worthless", "i'm not good enough", "i'm a failure", "guilt", "shame", "i'm burden"],
        "responses": [
            "These thoughts are depression talking, not truth. Your value doesn't depend on productivity or mistakes—you matter simply because you exist. Write down 3 things you did today, no matter how small, to prove you're capable and moving forward.",
            "Feelings of worthlessness require professional support. Please reach out to our crisis team or a mental health professional. You deserve to feel better, and help is available right now. These feelings are temporary and treatment works.",
        ]
    },

    "suicidal_thoughts": {
        "keywords": ["suicidal thoughts", "want to die", "kill myself", "end my life", "no point living", "better off dead", "hurt myself"],
        "responses": [
            "If you're having thoughts of suicide, please reach out immediately to our crisis team, call 988 (Suicide & Crisis Lifeline), or go to your nearest emergency room. These feelings are temporary, and help is available right now. You deserve support and your life has value.",
            "Crisis support is available 24/7. Please don't wait—reach out to us, call 911, or text HOME to 741741. Professional help can make a real difference. Your life matters, and there are people ready to help you right now.",
        ]
    },

    # ========================
    # STRESS - DETAILED
    # ========================
    "stress_what_is": {
        "keywords": ["what is stress", "stress definition", "explain stress", "tell me about stress", "stress is"],
        "responses": [
            "Stress is your body's response to demands or perceived threats. Some stress is normal and motivating, but chronic stress—continuous pressure without relief—can harm your physical and mental health. Learning to recognize and manage stress is essential for well-being.",
            "Stress happens when you feel pressured or overwhelmed. Your body releases stress hormones that prepare you to act, which is helpful temporarily. But prolonged stress without relief leads to anxiety, sleep problems, and physical health issues. Our techniques help manage stress effectively.",
        ]
    },

    "stress_symptoms": {
        "keywords": ["stress symptoms", "signs of stress", "stressed out", "too much stress", "overwhelmed", "can't cope", "stressed"],
        "responses": [
            "Stress shows up as muscle tension, headaches, sleep problems, appetite changes, irritability, difficulty concentrating, and feeling overwhelmed. Physical symptoms include stomach issues, chest tightness, or fatigue. If stress is constant, our management techniques and support can help.",
            "When stressed, you might feel irritable, forgetful, unfocused, or emotionally drained. You might have trouble relaxing or racing thoughts. These are signals that stress management is needed. Our tools help you identify triggers and build coping skills.",
        ]
    },

    "stress_coping": {
        "keywords": ["stress relief", "stress management", "reduce stress", "manage stress", "handle stress", "deal with stress", "de-stress"],
        "responses": [
            "Try the 'stress dump': write everything bothering you without filtering, then throw it away. Follow with deep breathing or a walk to reset mentally. Identify what you can control and focus there—let go of the rest. Breaking large tasks into smaller steps makes stress manageable.",
            "Exercise is powerful for stress relief—endorphins naturally calm you. Set boundaries (say no when needed), maintain connections, and practice relaxation (meditation, yoga). Consistency matters more than perfection. Our platform has guided exercises and tracking tools to support you.",
        ]
    },

    "work_stress": {
        "keywords": ["work stress", "job stress", "work overwhelmed", "deadline pressure", "work anxiety", "boss stress"],
        "responses": [
            "Work stress is manageable with boundaries and techniques. Use the Pomodoro method: focus 25 minutes, break 5 minutes. Leave work at work—when the day ends, mentally disconnect. If stress is chronic, set boundaries or talk to your manager about support.",
            "Remember: mistakes aren't catastrophic and your worth isn't your productivity. Celebrate wins, organize your tasks, and ask for help when needed. If work stress is affecting your mental health significantly, our support team can help you navigate it.",
        ]
    },

    "family_stress": {
        "keywords": ["family stress", "family conflict", "parents", "family problems", "family arguments", "family issues"],
        "responses": [
            "Family stress often comes from communication gaps. When tension rises, take a break instead of escalating conflict. Later, have calm conversations where each person shares their perspective without blame. Setting healthy boundaries protects your mental health.",
            "You can't control family behavior, only your response. Lean on friends or our community for support. Practice self-care and compassion for yourself. Our resources include communication tips for managing difficult family dynamics.",
        ]
    },

    # ========================
    # SLEEP - DETAILED
    # ========================
    "sleep_problems": {
        "keywords": ["can't sleep", "sleep problems", "insomnia", "trouble sleeping", "poor sleep", "not sleeping", "sleep issues"],
        "responses": [
            "Sleep problems often stem from stress, anxiety, depression, or poor sleep habits. Consistent sleep is crucial for mental and physical health—lack of sleep worsens mood and ability to cope. Our sleep solutions address both behavioral and relaxation aspects.",
            "If sleep is difficult, start with sleep hygiene: consistent bedtime, cool dark room, no screens 30 minutes before bed, and exercise earlier in the day. Our guided sleep meditation can help you fall asleep naturally.",
        ]
    },

    "insomnia_solutions": {
        "keywords": ["how to sleep better", "improve sleep", "fall asleep", "sleep tips", "better sleep", "sleep routine", "sleep hygiene"],
        "responses": [
            "Create a calming bedtime routine: dim lights, warm bath, reading, or gentle stretching. Keep your room cool (65-68°F), dark, and quiet. Go to bed at the same time daily. If you can't sleep within 20 minutes, get up and do a quiet activity until drowsy.",
            "Avoid caffeine after 2pm, limit screens before bed, and try progressive muscle relaxation or guided meditation. If your mind races, journal worries before bed. Consistency is key—stick to your routine for 2 weeks before assessing improvement.",
        ]
    },

    "nightmares": {
        "keywords": ["nightmares", "bad dreams", "scary dreams", "vivid dreams", "nightmare"],
        "responses": [
            "Nightmares can be unsettling but usually reflect stress or anxiety. Try 'imagery rehearsal therapy': rewrite the nightmare ending while awake, creating a positive version. Practice relaxation before bed to sleep more peacefully.",
            "Address daytime worries through journaling or talking with someone. Avoid violent content before bed. Most nightmares fade with better stress management and consistent sleep habits. If they persist, our support team can help.",
        ]
    },

    "sleep_mental_health": {
        "keywords": ["sleep depression", "tired all the time", "exhaustion", "fatigue", "sleep anxiety"],
        "responses": [
            "Sleep and mental health are deeply connected. Poor sleep worsens depression and anxiety, which then worsen sleep—a difficult cycle. Prioritize sleep as medicine: consistent bedtimes, dark rooms, and morning sunlight help regulate mood naturally.",
            "If sleep problems persist despite good habits, reach out to our support team. Sometimes sleep issues signal deeper concerns needing professional attention. We have resources and can connect you with specialists.",
        ]
    },

    # ========================
    # LONELINESS - DETAILED
    # ========================
    "loneliness": {
        "keywords": ["i feel lonely", "i am lonely", "loneliness", "feeling alone", "isolated", "no friends"],
        "responses": [
            "Loneliness is a painful feeling of disconnection from others, and it's more common than you think. It's different from being alone—you can feel lonely even surrounded by people. Connection is healing, and our community and resources help you find it.",
            "Isolation intensifies negative thoughts and worsens mental health. Break the cycle by reaching out today, even if it feels hard. Text someone, join a group, or use our community features. Small connections help significantly.",
        ]
    },

    "making_friends": {
        "keywords": ["make friends", "how to make friends", "hard to make friends", "meet people", "make new friends"],
        "responses": [
            "Making friends takes intention. Find your people through activities you enjoy: clubs, classes, volunteering, or online communities. Show up consistently, be authentic, and remember that others also want connection. A few genuine friends are enough.",
            "Quality matters more than quantity. Deepen one or two connections through vulnerability and genuine interest. Follow up, ask questions, and be patient. Our platform has groups and communities to help you meet people with similar interests.",
        ]
    },

    "social_isolation": {
        "keywords": ["isolated from people", "social isolation", "withdrawn", "shut in", "disconnected", "don't leave house"],
        "responses": [
            "Isolation feels safe but worsens mental health. Gently push yourself: one video call, one message, or one outing per day. You don't need energy—just action. Notice how connection helps, even slightly. Our community provides safe connection.",
            "Withdrawal is often a symptom of depression, not a character flaw. Reach out today—to a friend, family member, or our support team. We understand that connection feels hard right now, and we're here to help you rebuild it.",
        ]
    },

    "feeling_misunderstood": {
        "keywords": ["misunderstood", "no one gets me", "not understood", "nobody understands", "feel different"],
        "responses": [
            "Feeling misunderstood is isolating. Look for people who share your interests or struggles—they're more likely to understand you. Our community connects you with people who've experienced similar challenges and truly get it.",
            "Sometimes we need to help others understand us better. Share your feelings clearly and patiently. If someone consistently dismisses you, it's okay to invest less in that relationship. Quality connections matter more than quantity.",
        ]
    },

    # ========================
    # COPING & WELLBEING
    # ========================
    "self_care": {
        "keywords": ["self care", "self-care", "take care of myself", "wellness", "healthy habits", "look after myself"],
        "responses": [
            "Self-care is preventative medicine for mental health. Start small: a 10-minute walk, warm shower, hobby time, or connecting with someone. Each day, prioritize one thing that makes you feel better—sleep, movement, nutrition, and connection all matter.",
            "Self-care isn't selfish; it's necessary. Regularly exercise, eat nutritious food, maintain friendships, and do activities you enjoy. These are foundations for mental wellbeing that prevent struggles from escalating.",
        ]
    },

    "exercise_mood": {
        "keywords": ["exercise mental health", "workout mood", "physical activity depression", "get moving", "exercise helps"],
        "responses": [
            "Exercise is a powerful mood booster—it reduces anxiety and depression effectively. You don't need marathons: a 20-minute walk, yoga, or dancing improves mood immediately and builds resilience. Even 10 minutes of movement shifts your mood for the rest of the day.",
            "Movement doesn't require a gym. Walk outside, follow a free video, dance, or play sports. Consistency matters more than intensity. Regular exercise reduces symptoms as effectively as medication for many people.",
        ]
    },

    "nutrition_mood": {
        "keywords": ["nutrition mood", "healthy eating depression", "diet mental health", "eat healthy", "food mood"],
        "responses": [
            "What you eat affects your mood. Prioritize protein at meals, fruits and vegetables, and limit sugar and caffeine. Hydration matters—dehydration worsens anxiety and fatigue. Small dietary changes compound into improved mental health.",
            "A balanced diet supports neurotransmitters that regulate mood. Regular meals (not skipping) keep your energy and mood stable. Limit alcohol, excessive caffeine, and ultra-processed foods. Notice how nutrition affects your mental state.",
        ]
    },

    "mindfulness_meditation": {
        "keywords": ["mindfulness", "meditation", "guided meditation", "breathing exercises", "mindful", "meditation sleep"],
        "responses": [
            "Mindfulness brings your attention to the present moment, reducing anxiety and worry about the future. Start with 5-minute meditations and gradually increase. Our platform has guided meditations for sleep, stress relief, and anxiety management.",
            "Meditation doesn't require a quiet room or perfect silence. Even 5 minutes of focused breathing calms your nervous system. Consistency beats duration—daily practice builds resilience. Try our guided meditations to start.",
        ]
    },

    # ========================
    # PLATFORM NAVIGATION
    # ========================
    "features_overview": {
        "keywords": ["what can you do", "what are features", "how does this work", "what does this platform do", "platform features"],
        "responses": [
            "Our platform offers 24/7 chatbot support, mood tracking, a resource library with articles and exercises, coping techniques, journaling tools, and connection to licensed therapists. Everything is designed to support your mental health journey at your own pace.",
            "You can journal your thoughts, track your mood to understand patterns, access coping techniques, get support anytime, and reach out to our human support team. Explore each feature to find what helps you most.",
        ]
    },

    "find_therapists": {
        "keywords": ["find therapists", "find therapist", "need a therapist", "see a therapist", "therapist help"],
        "responses": [
            "Visit our Therapist Directory in the Resources section to find licensed professionals. You can filter by specialty, location, and insurance. Our 'Get Matched' feature recommends therapists based on your needs. Our team can also recommend someone.",
            "To connect with a therapist, visit the Therapist section, browse profiles, or use our matching service. Schedule a consultation directly through our app. Our support team can help if you need recommendations for specific concerns.",
        ]
    },

    "find_resources": {
        "keywords": ["find articles", "find resources", "where to find", "resource library", "need guides", "where are articles"],
        "responses": [
            "Our Resources section has articles, guides, and exercises organized by topic (anxiety, sleep, stress, depression, loneliness). Search for specific topics or browse by category. Our support team can recommend resources tailored to your needs.",
            "We have downloadable guides for meditation, journaling prompts, and mood tracking. Visit Resources to explore. Our library grows regularly with new content to support your wellbeing.",
        ]
    },

    "account_help": {
        "keywords": ["account help", "login help", "password reset", "signup", "profile settings", "create account"],
        "responses": [
            "To sign up, click 'Sign Up' and enter your email and password. Your account saves progress, mood history, and bookmarked resources. If you forget your password, click 'Forgot Password' to reset it. Our support team can help with account issues.",
            "Your profile is where you manage information, preferences, and view your mood history. Update goals, notification settings, and subscription from your Dashboard. Contact our team if you have account questions.",
        ]
    },

    "pricing_information": {
        "keywords": ["pricing", "cost", "how much", "plans", "subscriptions", "premium", "paid features"],
        "responses": [
            "We offer a free plan with chatbot access, basic resources, and mood tracking. Our premium plan unlocks unlimited therapy connections, personalized plans, advanced analytics, and priority support. Visit our Pricing page to compare plans and choose what works for you.",
            "Many core features are free because everyone deserves mental health support. Premium features help us provide more resources and support. You can try premium features risk-free. Most plans are affordable and often covered by insurance.",
        ]
    },

    "contact_support": {
        "keywords": ["contact support", "talk to support team", "human support", "speak to someone", "customer service", "get help"],
        "responses": [
            "Our human support team is available 24/7. Visit the Contact page or click 'Get Support' in the app to reach us. You can also schedule a consultation with a counselor. For urgent concerns, use our crisis line.",
            "Don't hesitate to reach out. Our team responds quickly and helps with technical issues, resource recommendations, or mental health concerns. We're here to support your wellbeing however we can.",
        ]
    },

    # ========================
    # GENERAL SUPPORT
    # ========================
    "not_understood": {
        "keywords": [],
        "responses": [
            "I'm not sure I understood that completely. Could you rephrase or tell me more about what you're experiencing? Are you dealing with anxiety, depression, stress, sleep issues, loneliness, or do you need help navigating our platform?",
            "I want to make sure I'm giving you the right support. Can you tell me more about what you need? Whether it's mental health support or platform help, I'm here to assist.",
            "I'm here to help! Are you looking for support with anxiety, depression, stress, sleep, loneliness, or information about our platform? Let me know how I can best support you.",
        ]
    },
}

def get_response(intent_name):
    """Get a random response for a given intent."""
    import random
    if intent_name in RESPONSES:
        responses = RESPONSES[intent_name].get('responses', [])
        if responses:
            return random.choice(responses)
    return RESPONSES['not_understood']['responses'][0]
