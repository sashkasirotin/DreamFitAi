import React, { useState, useEffect } from 'react';
import { Title, Text, Grid, Group, Stack, Badge, Button, Loader, Alert, RingProgress, Center } from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { IconSparkles } from '@tabler/icons-react';
import WaterTracker from '../components/WaterTracker';

const StatCard = ({ label, value, sub, color = 'violet', progress }) => (
    <div className="glass-card" style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap={4}>
                <Text fw={600} c="dimmed" size="xs" tt="uppercase">{label}</Text>
                <Title order={2} className={color === 'gradient' ? 'gradient-text' : ''} style={color !== 'gradient' ? { color: '#fff' } : {}}>{value}</Title>
                {sub && <Text size="xs" c="dimmed" mt={2}>{sub}</Text>}
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
    const [advice, setAdvice] = useState('');
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
                setMeals(mealsRes.data);
                setWorkouts(workoutsRes.data);
                setRoadmap(roadmapRes.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load data. Is the backend running?');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const totalWorkoutMins = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
    const goalCalories = roadmap?.daily_goal || roadmap?.dailyGoal || 2000;
    const caloriePercent = Math.min((totalCalories / goalCalories) * 100, 100);
    const calorieDiff = goalCalories - totalCalories;

    const handleGetAdvice = async () => {
        setLoadingAdvice(true);
        setAdvice('');
        try {
            const res = await api.post('/advice');
            setAdvice(res.data.advice);
        } catch {
            setAdvice('Could not fetch AI advice. Please try again.');
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
                    <Badge color="violet" size="lg" mb="sm" variant="dot">
                        Welcome back, {user?.name || 'Athlete'}!
                    </Badge>
                    <Title order={1} style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                        Ready to <span className="gradient-text">Crush It?</span>
                    </Title>
                    <Text size="lg" c="dimmed" style={{ maxWidth: 400 }}>
                        Track your meals, dominate your workouts, and unlock AI-powered insights.
                    </Text>
                </div>
            </div>

            {error && <Alert color="red" title="Error" radius="md">{error}</Alert>}

            {/* Stats */}
            <Grid>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <StatCard
                        label="Calories Today"
                        value={`${totalCalories.toLocaleString()} kcal`}
                        sub={`${Math.abs(calorieDiff)} kcal ${calorieDiff >= 0 ? 'left' : 'over'}`}
                        color="gradient"
                        progress={caloriePercent}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <StatCard
                        label="Daily Goal"
                        value={`${goalCalories.toLocaleString()} kcal`}
                        sub="Target intake"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <StatCard
                        label="Meals Logged"
                        value={meals.length}
                        sub="Today's entries"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <StatCard
                        label="Workout Time"
                        value={`${totalWorkoutMins} min`}
                        sub={`${workouts.length} sessions`}
                    />
                </Grid.Col>
                {roadmap && (
                    <Grid.Col span={12}>
                        <Alert color="violet" variant="light" title="Current Roadmap Track" icon={<IconSparkles size={16} />}>
                            <Group justify="space-between">
                                <Text size="sm">
                                    You are currently following the <b>{roadmap.weeks[0]?.title || 'AI Plan'}</b>. 
                                    Your daily target is <b>{goalCalories} kcal</b>. 
                                    Stay hydrated and log your meals to see your journey story!
                                </Text>
                                <Button size="xs" color="violet" variant="subtle" onClick={() => window.location.href='/roadmap'}>View Full Plan</Button>
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
                                        <Badge color="violet" variant="light">{w.duration_minutes} min</Badge>
                                    </Group>
                                ))}
                            </Stack>
                        )}
                    </div>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Stack gap="xl">
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
                            <Button
                                mt="md"
                                color="violet"
                                variant="light"
                                fullWidth
                                loading={loadingAdvice}
                                onClick={handleGetAdvice}
                            >
                                {advice ? 'Get New Advice' : 'Get AI Advice'}
                            </Button>
                        </div>

                        <WaterTracker />
                    </Stack>
                </Grid.Col>
            </Grid>
        </Stack>
    );
};

export default Dashboard;
