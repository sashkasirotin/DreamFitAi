import React, { useState, useEffect } from 'react';
import { Title, Text, Grid, Group, Stack, Badge, Button, Loader, Alert, RingProgress, Center } from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { IconSparkles, IconFlame, IconInfoCircle } from '@tabler/icons-react';
import WaterTracker from '../components/WaterTracker';
import FitnessNewsWidget from '../components/FitnessNewsWidget';

// Rough MET-based estimate: average workout burns ~7 kcal/min
// (moderate intensity — brisk walk ~5, running ~10, so 7 is a middle ground)
const estimateCaloriesBurned = (totalMinutes) => Math.round(totalMinutes * 7);

const StatCard = ({ label, value, sub, color = 'violet', progress, disclaimer }) => (
    <div className="glass-card" style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap={4}>
                <Text fw={600} c="dimmed" size="xs" tt="uppercase">{label}</Text>
                <Title order={2} className={color === 'gradient' ? 'gradient-text' : ''} style={color !== 'gradient' ? { color: '#fff' } : {}}>
                    {value}
                </Title>
                {sub && <Text size="xs" c="dimmed" mt={2}>{sub}</Text>}
                {disclaimer && (
                    <Text size="xs" c="orange" mt={4} fw={500}>
                        ⚠ {disclaimer}
                    </Text>
                )}
            </Stack>
            {progress !== undefined && (
                <RingProgress
                    size={80}
                    thickness={8}
                    roundCaps
                    sections={[{ value: progress, color: 'violet' }]}
                    label={
                        <Center>
                            <Text size="xs" fw={700}>{Math.round(progress)}%</Text>
                        </Center>
                    }
                />
            )}
        </Group>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [meals, setMeals] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [advice, setAdvice] = useState(() => localStorage.getItem('dreamfit_daily_advice') || '');
    const [roadmap, setRoadmap] = useState(null);
    const [loadingAdvice, setLoadingAdvice] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [mealsRes, workoutsRes, roadmapRes] = await Promise.all([
                    api.get('/meals'),
                    api.get('/workouts'),
                    api.get('/roadmap/latest'),
                ]);
                const today = new Date().setHours(0, 0, 0, 0);
                setMeals(mealsRes.data.filter(m => new Date(m.created_at).setHours(0, 0, 0, 0) === today));
                setWorkouts(workoutsRes.data.filter(w => new Date(w.created_at).setHours(0, 0, 0, 0) === today));
                setRoadmap(roadmapRes.data);
            } catch (err) {
                console.error('Fetch error:', err);
                const message = err.response
                    ? `Backend Error (${err.response.status}): ${err.response.data?.error || err.message}`
                    : 'Network Error: Cannot reach backend. Check your VITE_API_URL and CORS settings.';
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Fetch advice up to 3 times per day
        const lastAdviceDate = localStorage.getItem('dreamfit_advice_date');
        const adviceCount = parseInt(localStorage.getItem('dreamfit_advice_count') || '0');
        const todayDateStr = new Date().toDateString();

        if (lastAdviceDate !== todayDateStr) {
            // New day: reset counter and fetch
            handleGetAdvice();
            localStorage.setItem('dreamfit_advice_date', todayDateStr);
            localStorage.setItem('dreamfit_advice_count', '1');
        } else if (adviceCount < 3) {
            // Same day: fetch if under the limit of 3
            handleGetAdvice();
            localStorage.setItem('dreamfit_advice_count', (adviceCount + 1).toString());
        }
    }, []);

    const totalCaloriesIn = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const totalWorkoutMins = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
    const estimatedBurned = estimateCaloriesBurned(totalWorkoutMins);
    const netCalories = totalCaloriesIn - estimatedBurned;

    const goalCalories = roadmap?.daily_goal || roadmap?.dailyGoal || 2000;
    const caloriePercent = Math.min((totalCaloriesIn / goalCalories) * 100, 100);
    const calorieDiff = goalCalories - totalCaloriesIn;

    const handleGetAdvice = async () => {
        setLoadingAdvice(true);
        try {
            const res = await api.post('/advice');
            if (res.data && res.data.advice) {
                setAdvice(res.data.advice);
                localStorage.setItem('dreamfit_daily_advice', res.data.advice);
            }
        } catch (err) {
            console.error('Failed to fetch new AI advice, keeping old advice.');
        } finally {
            setLoadingAdvice(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loader color="violet" size="xl" />
            </div>
        );
    }

    const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <Stack gap="xl">
            {/* Hero */}
            <div className="dashboard-hero">
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, rgba(111,8,201,0.7) 0%, rgba(53,221,180,0.3) 100%)',
                    zIndex: 0,
                }} />
                <div className="dashboard-hero-content">
                    <Group mb="sm">
                        <Badge color="violet" size="lg" variant="dot">
                            Welcome back, {user?.name || 'Athlete'}!
                        </Badge>
                        <Badge color="cyan" size="lg" variant="light">
                            {todayFormatted}
                        </Badge>
                    </Group>
                    <Title order={1} style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                        Ready to <span className="gradient-text">Crush It?</span>
                    </Title>
                    <Text size="lg" c="dimmed" style={{ maxWidth: 400 }}>
                        Track your meals, dominate your workouts, and unlock AI-powered insights.
                    </Text>
                </div>
            </div>

            {error && <Alert color="red" title="Error" radius="md">{error}</Alert>}

            {/* Disclaimer Banner */}
            <Alert
                color="orange"
                variant="light"
                icon={<IconInfoCircle size={16} />}
                radius="md"
            >
                <Text size="sm">
                    <b>Heads up:</b> Calorie burn estimates are based on a general average (~7 kcal/min of workout).
                    Actual values vary by body weight, workout intensity, and fitness level.{' '}
                    <b>This is not a precise medical measurement</b> — use it as a rough daily guide.
                </Text>
            </Alert>

            {/* Stats */}
            <Grid>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <StatCard
                        label="Calories In"
                        value={`${totalCaloriesIn.toLocaleString()} kcal`}
                        sub={`${Math.abs(calorieDiff)} kcal ${calorieDiff >= 0 ? 'left of goal' : 'over goal'}`}
                        color="gradient"
                        progress={caloriePercent}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <StatCard
                        label="Est. Calories Burned"
                        value={`~${estimatedBurned.toLocaleString()} kcal`}
                        sub={`${totalWorkoutMins} min of workout`}
                        disclaimer="Estimate only — not precise"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <StatCard
                        label="Net Calories"
                        value={`${netCalories.toLocaleString()} kcal`}
                        sub="Calories in minus burned"
                        disclaimer="Estimate only — not precise"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <StatCard
                        label="Daily Calorie Goal"
                        value={`${goalCalories.toLocaleString()} kcal`}
                        sub="Target intake"
                    />
                </Grid.Col>

                {roadmap && (
                    <Grid.Col span={12}>
                        <Alert color="violet" variant="light" title="Current Roadmap Track" icon={<IconSparkles size={16} />}>
                            <Group justify="space-between">
                                <Text size="sm">
                                    You are currently following the <b>{roadmap.weeks?.[0]?.title || 'AI Plan'}</b>.{' '}
                                    Your daily target is <b>{goalCalories} kcal</b>.{' '}
                                    Stay hydrated and log your meals to see your journey story!
                                </Text>
                                <Button size="xs" color="violet" variant="subtle" onClick={() => window.location.href = '/roadmap'}>View Full Plan</Button>
                            </Group>
                        </Alert>
                    </Grid.Col>
                )}
            </Grid>

            {/* Recent Activity + AI */}
            <Grid>
                <Grid.Col span={{ base: 12, md: 7 }}>
                    <div className="glass-card">
                        <Title order={4} mb="md">Recent Meals</Title>
                        {meals.length === 0 ? (
                            <Text c="dimmed" size="sm">No meals logged yet. Go to "Log Meal" to add one!</Text>
                        ) : (
                            <Stack gap="xs">
                                {meals.slice(0, 5).map((meal) => (
                                    <Group key={meal.id} justify="space-between" style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Text size="sm" fw={500}>{meal.description}</Text>
                                        <Badge color="cyan" variant="light">{meal.calories} kcal</Badge>
                                    </Group>
                                ))}
                            </Stack>
                        )}

                        <Title order={4} mt="xl" mb="md">Recent Workouts</Title>
                        {workouts.length === 0 ? (
                            <Text c="dimmed" size="sm">No workouts logged yet. Go to "Log Workout" to add one!</Text>
                        ) : (
                            <Stack gap="xs">
                                {workouts.slice(0, 3).map((w) => (
                                    <Group key={w.id} justify="space-between" style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Text size="sm" fw={500}>{w.description}</Text>
                                        <Group gap="xs">
                                            <Badge color="violet" variant="light">{w.duration_minutes} min</Badge>
                                            <Badge color="orange" variant="dot" size="sm">
                                                ~{estimateCaloriesBurned(w.duration_minutes)} kcal burned*
                                            </Badge>
                                        </Group>
                                    </Group>
                                ))}
                                <Text size="xs" c="dimmed" mt="xs">* Estimate only. Actual burn varies by intensity and body weight.</Text>
                            </Stack>
                        )}
                    </div>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Stack gap="xl">
                        <FitnessNewsWidget />

                        <div className="glass-card">
                            <Group justify="space-between" mb="md">
                                <Title order={4}>AI Coach</Title>
                                <Badge color="pink" variant="light">Powered by Gemini</Badge>
                            </Group>
                            {advice ? (
                                <Text size="sm" style={{ lineHeight: 1.7, fontStyle: 'italic' }}>
                                    "{advice}"
                                </Text>
                            ) : (
                                <Text size="sm" c="dimmed" mb="md">
                                    Get personalized nutrition and fitness advice based on your logged activity.
                                </Text>
                            )}
                            {loadingAdvice ? (
                                <Center mt="md">
                                    <Loader color="violet" size="sm" type="dots" />
                                </Center>
                            ) : null}
                        </div>

                        <WaterTracker />
                    </Stack>
                </Grid.Col>
            </Grid>
        </Stack>
    );
};

export default Dashboard;
