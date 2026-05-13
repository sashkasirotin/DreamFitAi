import React, { useState, useEffect } from 'react';
import { Title, Text, Table, Badge, Group, Button, Stack, TextInput, NumberInput, FileInput, Alert } from '@mantine/core';
import { IconCamera, IconSparkles, IconInfoCircle } from '@tabler/icons-react';
import api from '../api';

const LogMeal = () => {
    const [meals, setMeals] = useState([]);
    const [name, setName] = useState('');
    const [calories, setCalories] = useState(0);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [aiSuccess, setAiSuccess] = useState(false);

    useEffect(() => {
        fetchMeals();
    }, []);

    const fetchMeals = async () => {
        try {
            const response = await api.get('/meals');
            setMeals(response.data);
        } catch (err) {
            console.error('Error fetching meals:', err);
        }
    };

    const handleLogMeal = async () => {
        if (!name || !calories) return;
        setLoading(true);
        try {
            setError('');
            // Log meal as text only — no image stored
            await api.post('/meals', {
                description: name,
                calories: Math.round(calories),
            });

            setName('');
            setCalories(0);
            setImage(null);
            setAiSuccess(false);
            fetchMeals();
        } catch (err) {
            console.error('Error logging meal:', err);
            setError(err.response?.data?.error || 'Failed to save meal. Check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzeAI = async () => {
        setAnalyzing(true);
        setAiSuccess(false);
        try {
            let base64Image = null;
            if (image) {
                const reader = new FileReader();
                base64Image = await new Promise((resolve) => {
                    reader.onload = () => resolve(reader.result.split(',')[1]);
                    reader.readAsDataURL(image);
                });
            }

            const response = await api.post('/meals/analyze', {
                description: name,
                image: base64Image,
            });

            if (response.data) {
                setName(response.data.description);
                setCalories(response.data.calories);
                setAiSuccess(true);
            }
        } catch (err) {
            console.error('AI Analysis error:', err);
            setError('AI analysis failed. Please try again.');
        } finally {
            // Clear photo after analysis — it's only used for estimation
            setImage(null);
            setAnalyzing(false);
        }
    };

    return (
        <Stack gap="xl">
            <div>
                <Title order={2} mb="md">Log a New Meal</Title>
                <div className="glass-card">
                    <Stack>
                        {error && <Alert color="red" mb="md" onClose={() => setError('')} withCloseButton>{error}</Alert>}
                        {aiSuccess && (
                            <Alert color="teal" mb="md" icon={<IconSparkles size={16} />}>
                                AI estimated the calories! Review and click <b>Log Meal</b> to save.
                            </Alert>
                        )}

                        <Group grow align="flex-end">
                            <TextInput
                                label="Meal Name or Description"
                                placeholder="e.g. Chicken Salad"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <NumberInput
                                label="Calories (kcal)"
                                placeholder="0"
                                value={calories}
                                onChange={setCalories}
                            />
                        </Group>

                        {/* Photo section — AI only, not stored */}
                        <div style={{
                            border: '1px dashed rgba(111,8,201,0.4)',
                            borderRadius: 8,
                            padding: '12px 16px',
                            background: 'rgba(111,8,201,0.05)'
                        }}>
                            <Group gap={6} mb={8}>
                                <IconCamera size={16} style={{ color: 'var(--mantine-color-violet-filled)' }} />
                                <Text size="sm" fw={600}>AI Calorie Estimator</Text>
                                <Badge color="violet" variant="dot" size="sm">Photo not stored</Badge>
                            </Group>
                            <Text size="xs" c="dimmed" mb="sm">
                                Take or upload a photo of your meal so our AI can estimate the calorie content.
                                The photo is only used for analysis and is <b>never saved</b>.
                            </Text>
                            <Group align="flex-end" gap="sm">
                                <FileInput
                                    placeholder="Choose a meal photo..."
                                    leftSection={<IconCamera size={14} />}
                                    value={image}
                                    onChange={setImage}
                                    accept="image/png,image/jpeg"
                                    style={{ flex: 1 }}
                                    clearable
                                />
                                <Button
                                    color="violet"
                                    variant="light"
                                    leftSection={<IconSparkles size={16} />}
                                    onClick={handleAnalyzeAI}
                                    loading={analyzing}
                                    disabled={!name && !image}
                                >
                                    Estimate Calories
                                </Button>
                            </Group>
                        </div>

                        <Alert color="blue" variant="light" icon={<IconInfoCircle size={14} />} py="xs">
                            You can also type a meal description and click <b>Estimate Calories</b> without a photo.
                        </Alert>

                        <Button
                            color="violet"
                            size="md"
                            onClick={handleLogMeal}
                            loading={loading}
                            disabled={!name || !calories}
                            fullWidth
                        >
                            Log Meal
                        </Button>
                    </Stack>
                </div>
            </div>

            <div>
                <Title order={2} mb="md">Today's Meals</Title>
                <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <Table verticalSpacing="md" highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Meal</Table.Th>
                                <Table.Th>Time</Table.Th>
                                <Table.Th>Calories</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {meals.length === 0 ? (
                                <Table.Tr>
                                    <Table.Td colSpan={3}>
                                        <Text c="dimmed" size="sm" ta="center" py="md">No meals logged yet today.</Text>
                                    </Table.Td>
                                </Table.Tr>
                            ) : (
                                meals.map((meal) => (
                                    <Table.Tr key={meal.id}>
                                        <Table.Td fw={500}>{meal.description}</Table.Td>
                                        <Table.Td>{new Date(meal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Table.Td>
                                        <Table.Td>
                                            <Badge variant="light" color="cyan">{meal.calories} kcal</Badge>
                                        </Table.Td>
                                    </Table.Tr>
                                ))
                            )}
                        </Table.Tbody>
                    </Table>
                </div>
            </div>
        </Stack>
    );
};

export default LogMeal;
