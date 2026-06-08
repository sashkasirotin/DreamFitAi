/**
 * @file AIRoadmap.jsx
 * @description Page allowing users to fill out a wellness profile questionnaire 
 * and generate a customized 4-week fitness and nutrition roadmap from the Google Gemini AI.
 */

import React, { useState, useEffect } from 'react';
import { Title, Text, Stack, TextInput, NumberInput, Select, Button, Stepper, List, ThemeIcon, Badge, Group, Grid, Alert, Loader } from '@mantine/core';
import { IconCheck, IconMap2, IconSparkles, IconPointFilled, IconInfoCircle } from '@tabler/icons-react';
import api from '../api';

const AIRoadmap = () => {
    // Stepper component step progression (0 = Profile Questionnaire, 1 = Plan View)
    const [active, setActive] = useState(0);
    const [loading, setLoading] = useState(false);
    const [roadmap, setRoadmap] = useState(null);
    const [upgrading, setUpgrading] = useState(false);

    const triggerUpgrade = async (current) => {
        if (!current || !current.is_fallback || upgrading) return;
        setUpgrading(true);
        // Wait 6 seconds before retrying to let rate limits settle
        setTimeout(async () => {
            try {
                const res = await api.post('/roadmap/upgrade');
                if (res.data && !res.data.is_fallback && res.data._upgraded) {
                    setRoadmap(res.data);
                    setUpgrading(false);
                    window.dispatchEvent(new CustomEvent('show-toast', {
                        detail: {
                            message: '✨ Your personalized fitness roadmap has been successfully upgraded with AI guidance!',
                            color: 'violet'
                        }
                    }));
                } else if (res.data && res.data.is_fallback) {
                    setUpgrading(false);
                    setTimeout(() => triggerUpgrade(res.data), 15000);
                } else {
                    setUpgrading(false);
                }
            } catch (err) {
                console.warn('Background roadmap upgrade retry failed:', err);
                setUpgrading(false);
                setTimeout(() => triggerUpgrade(current), 25000);
            }
        }, 6000);
    };

    // Load existing roadmap on component mount if user has generated one previously
    useEffect(() => {
        const loadRoadmap = async () => {
            try {
                const res = await api.get('/roadmap/latest');
                if (res.data) {
                    setRoadmap(res.data);
                    setActive(1); // Skip straight to step 1 (Roadmap View)
                    if (res.data.is_fallback) {
                        triggerUpgrade(res.data);
                    }
                }
            } catch (err) {
                console.error('Failed to load existing roadmap', err);
            }
        };
        loadRoadmap();
    }, []);

    // Questionnaire form state variables with typical default starter statistics
    const [formData, setFormData] = useState({
        age: 25,
        gender: 'Female',
        weight: 70,
        height: 170,
        goal: 'Lose 5kg',
        activityLevel: 'Moderate',
        dietaryPref: 'No restrictions',
        bodyStructure: 'Average'
    });

    // POSTs current user profile data to backend to call Gemini AI generator
    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await api.post('/roadmap/generate', formData);
            setRoadmap(res.data);
            setActive(1); // Progress Stepper to display generated roadmap
            if (res.data.is_fallback) {
                triggerUpgrade(res.data);
            }
        } catch (err) {
            console.error('Failed to generate roadmap', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack gap="xl">
            {/* Header section detailing page name and consultant label */}
            <Group justify="space-between">
                <Title order={1}>AI Weight Loss Roadmap</Title>
                <Badge size="lg" color="violet" variant="light" leftSection={<IconSparkles size={14} />}>
                    AI Consultant (Gemini)
                </Badge>
            </Group>

            {/* Stepper Wizard separating profile inputs and final generated results */}
            <Stepper active={active} onStepClick={setActive} color="violet" breakpoint="sm">
                
                {/* Step 1: User Profile questionnaire form */}
                <Stepper.Step label="Your Profile" description="Fill out the questionnaire" allowStepSelect={active > 0}>
                    <div className="glass-card" style={{ maxWidth: 700, margin: '20px auto' }}>
                        <Stack gap="md">
                            <Group grow>
                                <Select
                                    label="Gender"
                                    data={['Male', 'Female', 'Other']}
                                    value={formData.gender}
                                    onChange={(val) => setFormData({ ...formData, gender: val })}
                                    withAsterisk
                                />
                                <NumberInput
                                    label="Age"
                                    value={formData.age}
                                    onChange={(val) => setFormData({ ...formData, age: val })}
                                    withAsterisk
                                />
                            </Group>
                            <Group grow>
                                <NumberInput
                                    label="Weight (kg)"
                                    value={formData.weight}
                                    onChange={(val) => setFormData({ ...formData, weight: val })}
                                    withAsterisk
                                />
                                <NumberInput
                                    label="Height (cm)"
                                    value={formData.height}
                                    onChange={(val) => setFormData({ ...formData, height: val })}
                                    withAsterisk
                                />
                            </Group>
                            <Group grow>
                                <Select
                                    label="Activity Level"
                                    data={['Sedentary', 'Moderate', 'Very Active']}
                                    value={formData.activityLevel}
                                    onChange={(val) => setFormData({ ...formData, activityLevel: val })}
                                />
                                <Select
                                    label="Body Structure"
                                    data={['Ectomorph (Lean)', 'Mesomorph (Athletic)', 'Endomorph (Broad)']}
                                    value={formData.bodyStructure}
                                    onChange={(val) => setFormData({ ...formData, bodyStructure: val })}
                                />
                            </Group>
                            <TextInput
                                label="Specific Goal"
                                placeholder="e.g. Lose 5kg in 2 months"
                                value={formData.goal}
                                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                withAsterisk
                            />
                            <TextInput
                                label="Dietary Preferences"
                                placeholder="e.g. Vegetarian, Keto, No seafood"
                                value={formData.dietaryPref}
                                onChange={(e) => setFormData({ ...formData, dietaryPref: e.target.value })}
                            />
                            <Alert color="blue" variant="light" icon={<IconInfoCircle size={16} />} mt="sm">
                                You can regenerate your roadmap after 4 weeks, or whenever you feel you need to restart the process and set new goals!
                            </Alert>
                            <Button
                                color="violet"
                                fullWidth
                                size="md"
                                mt="sm"
                                onClick={handleGenerate}
                                loading={loading}
                                disabled={!formData.gender || !formData.age || !formData.weight || !formData.height || !formData.goal}
                                leftSection={<IconMap2 size={20} />}
                            >
                                {roadmap ? 'Regenerate My Plan' : 'Generate My Plan'}
                            </Button>
                        </Stack>
                    </div>
                </Stepper.Step>

                {/* Step 2: Custom 4-Week Roadmap results view */}
                <Stepper.Step label="Your Roadmap" description="View your 4-week plan" allowStepSelect={!!roadmap}>
                    {roadmap && (
                        <Stack gap="xl" mt="xl">
                            {roadmap.is_fallback && (
                                <Alert color="orange" title={upgrading ? "Upgrading to AI Plan..." : "Offline Static Calculation"} icon={<IconInfoCircle size={16} />} variant="light">
                                    {upgrading ? (
                                        <Group gap="xs">
                                            <Loader size="xs" color="orange" />
                                            <Text size="sm">Gemini AI is offline or rate-limited. Retrying to upgrade your personalized fitness plan with AI in the background...</Text>
                                        </Group>
                                    ) : (
                                        "The AI service is currently offline or taking too long. We have successfully generated this personalized roadmap using the scientific Mifflin-St Jeor formula and standard physical templates. We will attempt to upgrade it automatically in the background..."
                                    )}
                                </Alert>
                            )}

                            {/* Target Daily Calorie indicator card */}
                            <div className="glass-card" style={{ border: '1px solid rgba(167, 66, 245, 0.3)' }}>
                                <Group justify="space-between">
                                    <Stack gap={4}>
                                        <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Daily Calorie Target</Text>
                                        <Title order={2} className="gradient-text">
                                            {roadmap.daily_goal || roadmap.dailyGoal} kcal
                                        </Title>
                                    </Stack>
                                    <IconSparkles size={40} color="var(--mantine-color-violet-filled)" />
                                </Group>
                            </div>

                            {/* 4-Week Progress program Grid layout */}
                            <Grid>
                                {(roadmap.weeks || []).map((week, index) => (
                                    <Grid.Col span={{ base: 12, sm: 6 }} key={index}>
                                        <div className="glass-card" style={{ height: '100%' }}>
                                            <Badge mb="xs" color="violet">Week {index + 1}</Badge>
                                            <Title order={4} mb={4}>{week.title}</Title>
                                            <Text size="xs" c="dimmed" mb="sm" fs="italic">{week.focus}</Text>
                                            <Stack gap={6}>
                                                {(week.bullets || []).map((bullet, bIdx) => (
                                                    <Group key={bIdx} gap={8} align="flex-start" wrap="nowrap">
                                                        <IconPointFilled
                                                            size={10}
                                                            style={{ color: 'var(--mantine-color-violet-filled)', marginTop: 5, flexShrink: 0 }}
                                                        />
                                                        <Text size="sm">{bullet}</Text>
                                                    </Group>
                                                ))}
                                            </Stack>
                                        </div>
                                    </Grid.Col>
                                ))}
                            </Grid>

                            {/* AI Expert Tips panel */}
                            <div className="glass-card">
                                <Title order={4} mb="md">Personalized Expert Tips</Title>
                                <List
                                    spacing="md"
                                    size="sm"
                                    center
                                    icon={
                                        <ThemeIcon color="teal" size={24} radius="xl">
                                            <IconCheck size={16} />
                                        </ThemeIcon>
                                    }
                                >
                                    {(roadmap.tips || []).map((tip, index) => (
                                        <List.Item key={index}>
                                            {typeof tip === 'object' ? (
                                                <>
                                                    <Text fw={700} span>{tip.title}: </Text>
                                                    <Text span>{tip.description}</Text>
                                                </>
                                            ) : tip}
                                        </List.Item>
                                    ))}
                                </List>
                            </div>

                            <Button variant="light" color="gray" onClick={() => setActive(0)}>
                                Back to Profile
                            </Button>
                        </Stack>
                    )}
                </Stepper.Step>
            </Stepper>
        </Stack>
    );
};

export default AIRoadmap;

