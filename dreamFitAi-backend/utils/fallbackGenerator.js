/**
 * @file fallbackGenerator.js
 * @description Provides static fallback calculations and templated generators for AI features.
 */

const ROADMAP_TEMPLATES = {
    lose: {
        weeks: [
            {
                title: "Week 1: Baseline & Calorie Deficit",
                focus: "Initiate a safe calorie deficit and establish logging routines.",
                bullets: [
                    "Maintain your daily target of {calories} kcal with balanced, low-density foods.",
                    "Drink at least 2.5 to 3 liters of water daily to support metabolic function.",
                    "Engage in 150 minutes of moderate-intensity cardio (e.g., brisk walking or cycling).",
                    "Limit processed sugars and simple carbs, replacing them with leafy greens and whole grains."
                ]
            },
            {
                title: "Week 2: Strength & Muscle Preservation",
                focus: "Incorporate resistance training to preserve lean mass while losing fat.",
                bullets: [
                    "Prioritize protein: target 1.6g to 2g of protein per kg of body weight.",
                    "Perform 3 full-body resistance sessions focusing on basic bodyweight movements.",
                    "Introduce 1-2 short High-Intensity Interval Training (HIIT) sessions.",
                    "Ensure 7-8 hours of quality sleep to optimize recovery and control cortisol levels."
                ]
            },
            {
                title: "Week 3: Cardiorespiratory Capacity & Step Focus",
                focus: "Increase daily non-exercise activity thermogenesis (NEAT) and aerobic fitness.",
                bullets: [
                    "Aim for a daily step goal of 10,000 steps to keep your metabolic rate elevated.",
                    "Increase weights or reps slightly in your strength training sessions.",
                    "Prep your weekly meals in advance to avoid impulsive dining decisions.",
                    "Keep water intake high, especially during and after exercise sessions."
                ]
            },
            {
                title: "Week 4: Re-evaluation & Sustainable Habits",
                focus: "Consolidate your routine and establish long-term weight management habits.",
                bullets: [
                    "Log weight and take progress photos to compare with your Week 1 starting point.",
                    "Define a weekly exercise schedule that comfortably fits your lifestyle.",
                    "Practice mindful eating: chew slowly and stop eating at 80% fullness.",
                    "Plan a transition to your maintenance calories once your current weight goal is met."
                ]
            }
        ],
        tips: [
            {
                title: "Hydration Check",
                description: "Thirst is frequently confused with hunger. Drink a glass of water before snacking."
            },
            {
                title: "Track Cooking Oils",
                description: "Hidden calories from cooking fats and sauces can easily erase your calorie deficit. Measure them carefully."
            },
            {
                title: "Focus on Sleep",
                description: "Lack of sleep increases ghrelin (the hunger hormone) and decreases leptin (the fullness hormone)."
            }
        ]
    },
    gain: {
        weeks: [
            {
                title: "Week 1: Clean Bulking & Muscle Activation",
                focus: "Initiate a caloric surplus to support new muscle tissue growth.",
                bullets: [
                    "Maintain your daily calorie target of {calories} kcal with nutrient-dense foods.",
                    "Perform compound strength exercises (squats, chest press, rows) 3 times this week.",
                    "Track macronutrients: aim for roughly 50% carbs, 25% protein, and 25% healthy fats.",
                    "Consume a protein-rich snack or shake within 45 minutes after strength training."
                ]
            },
            {
                title: "Week 2: Progressive Overload & Heavy Sets",
                focus: "Stimulate muscle hypertrophy by increasing training intensity.",
                bullets: [
                    "Increase resistance or weights slightly while maintaining strict movement form.",
                    "Eat complex carbohydrates (oatmeal, brown rice, sweet potatoes) to power your lifts.",
                    "Keep cardiovascular sessions low-intensity and limited to 20 mins to prevent excessive calorie burn.",
                    "Aim for 8 hours of sleep for optimal growth hormone release."
                ]
            },
            {
                title: "Week 3: High Volume & Recovery",
                focus: "Maximize muscle fatigue and prioritize structural repair.",
                bullets: [
                    "Increase sets or repetition count (e.g., 3-4 sets of 8-12 repetitions per exercise).",
                    "Add calorie-dense additions like nuts, avocado, and seeds to meet calorie goals easily.",
                    "Hydrate with 3-3.5 liters of water daily to support muscle hydration.",
                    "Take 2 complete rest days to let muscle fibers repair and grow stronger."
                ]
            },
            {
                title: "Week 4: Strength Peak & Assessment",
                focus: "Verify physical improvements and plan your next progression block.",
                bullets: [
                    "Perform a strength benchmark (e.g., max reps with a set weight) to track progress.",
                    "Record weight and take progress photos to evaluate lean mass gains.",
                    "Refine post-workout nutrition: combine fast-acting carbs and quality protein.",
                    "Adjust calorie intake if weight change has plateaued."
                ]
            }
        ],
        tips: [
            {
                title: "Liquid Calories",
                description: "If you struggle to meet calorie targets, add protein shakes with oats, peanut butter, and bananas."
            },
            {
                title: "Consistency in Lifting",
                description: "Muscle growth requires continuous stimulation. Stick to your lifting schedule."
            },
            {
                title: "Clean Eating",
                description: "A caloric surplus doesn't mean eating junk. Focus on quality whole foods to gain lean mass."
            }
        ]
    },
    maintain: {
        weeks: [
            {
                title: "Week 1: Balance & Foundation",
                focus: "Establish a baseline calorie balance and functional fitness routine.",
                bullets: [
                    "Aim for your daily target of {calories} kcal to balance active expenditure.",
                    "Perform 2-3 resistance training sessions to maintain active lean tissue.",
                    "Include 150 minutes of light cardio (walking, slow cycling) for heart health.",
                    "Focus on food quality: load your plate with high-fiber whole foods."
                ]
            },
            {
                title: "Week 2: Body Composition Focus",
                focus: "Refine body composition by optimizing macronutrient balance.",
                bullets: [
                    "Target a balanced protein intake (about 1.2g to 1.6g per kg of body weight).",
                    "Mix up your routine with functional movements (planks, kettlebell work).",
                    "Monitor energy levels and sleep quality; adjust hydration accordingly.",
                    "Minimize added sugars and processed foods to support metabolic health."
                ]
            },
            {
                title: "Week 3: Athletic Performance & Mobility",
                focus: "Improve mobility, flexibility, and overall athletic movement quality.",
                bullets: [
                    "Add a 15-minute mobility or yoga session before or after your workouts.",
                    "Include 1-2 interval training (HIIT) sessions to challenge your fitness.",
                    "Ensure you are eating a wide variety of colorful vegetables for micronutrient coverage.",
                    "Practice active recovery: take walks on your rest days."
                ]
            },
            {
                title: "Week 4: Sustain & Adapt",
                focus: "Consolidate your habits for long-term health and lifestyle sustainability.",
                bullets: [
                    "Verify that your weight is stable; adjust calories slightly if needed.",
                    "Evaluate your physical comfort, energy, and strength levels.",
                    "Establish a workout frequency that you can easily maintain year-round.",
                    "Celebrate consistency—maintaining healthy habits is a lifetime success!"
                ]
            }
        ],
        tips: [
            {
                title: "Active Recovery",
                description: "On rest days, light walking or stretching helps increase circulation and speeds up recovery."
            },
            {
                title: "Portion Control",
                description: "Maintain awareness of portion sizes. Even healthy foods can lead to weight gain if overeaten."
            },
            {
                title: "Mindful Maintenance",
                description: "Weight maintenance isn't static. Expect minor fluctuations (+/- 1-2 kg) and focus on averages."
            }
        ]
    }
};

/**
 * Generates a fallback 4-week roadmap using Mifflin-St Jeor equation.
 */
function generateStaticRoadmap(profile) {
    const { age, gender, weight, height, goal, activityLevel, bodyStructure } = profile;

    // 1. Calculate BMR (Mifflin-St Jeor)
    let bmr;
    const w = Number(weight) || 70;
    const h = Number(height) || 170;
    const a = Number(age) || 25;
    const g = String(gender).toLowerCase();

    if (g === 'male') {
        bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else if (g === 'female') {
        bmr = 10 * w + 6.25 * h - 5 * a - 161;
    } else {
        bmr = 10 * w + 6.25 * h - 5 * a - 80; // neutral average
    }

    // 2. Scale by Activity Level
    let multiplier = 1.2;
    const act = String(activityLevel).toLowerCase();
    if (act.includes('moderate')) {
        multiplier = 1.55;
    } else if (act.includes('very active') || act.includes('highly')) {
        multiplier = 1.725;
    }

    const tdee = bmr * multiplier;

    // 3. Determine Goal Calories
    let dailyGoal = Math.round(tdee);
    let goalType = 'maintain';
    const goalStr = String(goal).toLowerCase();

    if (goalStr.includes('lose') || goalStr.includes('cut') || goalStr.includes('deficit') || goalStr.includes('drop')) {
        goalType = 'lose';
        const minCal = (g === 'female') ? 1200 : 1500;
        dailyGoal = Math.max(Math.round(tdee - 500), minCal);
    } else if (goalStr.includes('gain') || goalStr.includes('bulk') || goalStr.includes('muscle') || goalStr.includes('build')) {
        goalType = 'gain';
        dailyGoal = Math.round(tdee + 350);
    }

    // 4. Retrieve and Format Template
    const template = ROADMAP_TEMPLATES[goalType];
    const formattedWeeks = template.weeks.map(week => ({
        title: week.title,
        focus: week.focus,
        bullets: week.bullets.map(b => b.replace(/{calories}/g, dailyGoal))
    }));

    return {
        dailyGoal,
        weeks: formattedWeeks,
        tips: template.tips,
        is_fallback: true
    };
}

/**
 * Generates static fitness/nutrition advice based on logs.
 */
function generateStaticAdvice(meals, workouts) {
    const advicePool = [
        "Consistency is the true foundation of fitness. Small, daily efforts compound into major transformations.",
        "Ensure you prioritize recovery. Sleep (7-8 hours) is when your muscles actually rebuild and adapt.",
        "Hydration is key. Drink at least 8-10 glasses of water daily to support muscle recovery and digestion.",
        "Ensure you consume high-quality protein with each meal to help preserve and repair muscle tissues.",
        "Incorporate mobility or stretching into your weekly routine to avoid injuries and preserve joint health."
    ];

    let adviceText = advicePool[Math.floor(Math.random() * advicePool.length)];

    if (workouts && workouts.length > 0) {
        const lastWorkout = workouts[0];
        adviceText = `Awesome job logging your recent workout "${lastWorkout.name || 'exercise'}" (${lastWorkout.duration || 30} mins)! Make sure to consume a mix of fast-absorbing protein and carbohydrates within 2 hours of training to maximize recovery and restore glycogen levels.`;
    } else if (meals && meals.length > 0) {
        const lastMeal = meals[0];
        adviceText = `Great effort tracking your meals, like "${lastMeal.description || 'food'}"! For your next meal, focus on adding color to your plate with nutrient-dense vegetables, and ensure you include a high-quality protein source.`;
    }

    return {
        advice: adviceText,
        is_fallback: true
    };
}

/**
 * Performs keyword-based parsing of meals to estimate calories/protein.
 */
function generateStaticMealAnalysis(description) {
    let calories = 350; // Default average meal
    let protein = 15;   // Default average protein
    let breakdown = "Estimated using a standard meal profile. Provide a detailed text description or upload a clear photo for high-accuracy estimations.";

    if (description) {
        const desc = description.toLowerCase();
        let matches = 0;

        if (desc.includes("chicken") || desc.includes("turkey") || desc.includes("breast") || desc.includes("poultry")) {
            calories = 280;
            protein = 35;
            breakdown = "Chicken/turkey breast is high in lean protein and low in dietary fat, promoting muscle recovery.";
            matches++;
        } else if (desc.includes("salmon") || desc.includes("tuna") || desc.includes("fish") || desc.includes("seafood")) {
            calories = 320;
            protein = 30;
            breakdown = "Fish provides high-quality protein along with heart-healthy omega-3 essential fatty acids.";
            matches++;
        } else if (desc.includes("beef") || desc.includes("steak") || desc.includes("pork") || desc.includes("meat")) {
            calories = 420;
            protein = 32;
            breakdown = "Red meat offers complete protein and is rich in essential iron, zinc, and B-vitamins.";
            matches++;
        } else if (desc.includes("egg") || desc.includes("eggs") || desc.includes("omelette")) {
            calories = 160;
            protein = 13;
            breakdown = "Eggs are highly bioavailable, providing complete amino acids and essential micronutrients.";
            matches++;
        }

        if (desc.includes("rice") || desc.includes("oat") || desc.includes("bread") || desc.includes("pasta") || desc.includes("potato")) {
            if (matches > 0) {
                // Add carbs on top of protein source
                calories += 180;
                protein += 4;
                breakdown += " Added complex carbohydrates supply steady muscle glycogen to power workouts.";
            } else {
                calories = 220;
                protein = 5;
                breakdown = "Complex carbohydrates offer the body steady glycogen replenishment and energy.";
            }
        } else if (desc.includes("salad") || desc.includes("vegetable") || desc.includes("veggie") || desc.includes("broccoli")) {
            if (matches > 0) {
                calories += 50;
                protein += 2;
                breakdown += " Greens supply vital fiber, vitamins, and minerals with minimal added calories.";
            } else {
                calories = 80;
                protein = 2;
                breakdown = "Vegetables are rich in dietary fiber, water, and health-promoting micronutrients.";
            }
        } else if (desc.includes("shake") || desc.includes("whey") || desc.includes("protein powder")) {
            calories = 140;
            protein = 25;
            breakdown = "Whey or plant protein isolate offers rapid absorption of amino acids, ideal for post-workout repair.";
        }
    }

    return {
        description: description || "Logged Meal",
        calories,
        protein,
        breakdown,
        is_fallback: true
    };
}

/**
 * Builds a narrative fitness story based on logged progress photos.
 */
function generateStaticStory(progressEntries) {
    if (!progressEntries || progressEntries.length === 0) {
        return {
            title: "Your Fitness Story",
            full_story: "You haven't logged any progress photos yet. Once you upload photos, we'll build a visual and analytical timeline of your transformation!",
            segments: [],
            key_wins: ["Log your first photo to start your story"],
            is_fallback: true
        };
    }

    const sorted = [...progressEntries].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const startWeight = sorted[0].weight;
    const currentWeight = sorted[sorted.length - 1].weight;
    const weightDiff = (startWeight - currentWeight).toFixed(1);

    let winMsg = "";
    if (weightDiff > 0) {
        winMsg = `Down ${weightDiff}kg since your first progress entry!`;
    } else if (weightDiff < 0) {
        winMsg = `Gained ${Math.abs(weightDiff)}kg (supporting muscle development).`;
    } else {
        winMsg = "Maintained your body weight consistently.";
    }

    const segments = sorted.map((entry, idx) => {
        return {
            photo_url: entry.photo_url,
            caption: `Progress Update - ${new Date(entry.created_at).toLocaleDateString()}`,
            segment_text: `Logged a weight of ${entry.weight}kg. Your photo on this day represents consistent effort and logging discipline.`
        };
    });

    return {
        title: "Your Consistency Timeline",
        full_story: `Your fitness journey began tracking at a starting weight of ${startWeight}kg. Over ${sorted.length} progress photo logs, your weight is now ${currentWeight}kg. ${winMsg} Keep taking consistent photos to monitor body changes and stay accountable!`,
        segments,
        key_wins: [
            winMsg,
            `Logged ${sorted.length} visual progress checkins`,
            "Sustained logging discipline"
        ],
        is_fallback: true
    };
}

module.exports = {
    generateStaticRoadmap,
    generateStaticAdvice,
    generateStaticMealAnalysis,
    generateStaticStory
};
