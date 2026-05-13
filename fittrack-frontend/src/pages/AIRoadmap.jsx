import React, { useState, useEffect } from 'react';
import { Title, Text, Stack, TextInput, NumberInput, Select, Button, Stepper, List, ThemeIcon, Badge, Group, Grid } from '@mantine/core';
import { IconCheck, IconMap2, IconSparkles, IconPointFilled } from '@tabler/icons-react';
import api from '../api';

const AIRoadmap = () => {
    const [active, setActive] = useState(0);
    const [loading, setLoading] = useState(false);
    const [roadmap, setRoadmap] = useState(null);

    useEffect(() => {
        const loadRoadmap = async () => {
            try {
                const res = await api.get('/roadmap/latest');
                if (res.data) {
                    setRoadmap(res.data);
                    setActive(1);
                }
            } catch (err) {
                console.error('Failed to load existing roadmap', err);
            }
        };
        loadRoadmap();
    }, []);

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

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await api.post('/roadmap/generate', formData);
            setRoadmap(res.data);
            setActive(1);
        } catch (err) {
            console.error('Failed to generate roadmap', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack gap="xl">
            <Group justify="space-between">
                <Title order={1}>AI Weight Loss Roadmap</Title>
                <Badge size="lg" color="violet" variant="light" leftSection={<IconSparkles size={14} />}>
                    AI Consultant (Gemini)
                </Badge>
            </Group>

            <Stepper active={active} onStepClick={setActive} color="violet" breakpoint="sm">
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
                            <Button
                                color="violet"
                                fullWidth
                                size="md"
                                mt="xl"
                                onClick={handleGenerate}
                                loading={loading}
                                disabled={!formData.gender || !formData.age || !formData.weight || !formData.height || !formData.goal}
                                leftSection={<IconMap2 size={20} />}
                            >
                                Generate My Plan
                            </Button>
                        </Stack>
                    </div>
                </Stepper.Step>

                <Stepper.Step label="Your Roadmap" description="View your 4-week plan" allowStepSelect={!!roadmap}>
                    {roadmap && (
                        <Stack gap="xl" mt="xl">
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

                            {/* Week Cards with bullets */}
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

                            {/* Tips */}
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
                                Regenerate Plan
                            </Button>
                        </Stack>
                    )}
                </Stepper.Step>
            </Stepper>
        </Stack>
    );
};

export default AIRoadmap;
