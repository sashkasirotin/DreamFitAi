import React, { useState, useRef } from 'react';
import { Title, Text, Badge, Group, Button, Stack, TextInput, NumberInput, Select, Textarea, Alert, ActionIcon, Grid } from '@mantine/core';
import { IconCamera, IconSparkles, IconInfoCircle, IconPhoto, IconX, IconArrowBackUp } from '@tabler/icons-react';
import api from '../api';

const WORKOUT_TYPES = [
    { value: 'Strength', label: '💪 Strength Training' },
    { value: 'Cardio', label: '🏃 Cardio' },
    { value: 'HIIT', label: '⚡ HIIT' },
    { value: 'Yoga', label: '🧘 Yoga / Flexibility' },
    { value: 'Sports', label: '⚽ Sports' },
    { value: 'Other', label: '🏋️ Other' },
];

const LogActivity = () => {
    // --- Meal State ---
    const [name, setName] = useState('');
    const [calories, setCalories] = useState(0);
    const [protein, setProtein] = useState(0);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loadingMeal, setLoadingMeal] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [errorMeal, setErrorMeal] = useState('');
    const [aiSuccess, setAiSuccess] = useState(false);
    const [successMeal, setSuccessMeal] = useState(false);

    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    // --- Workout State ---
    const [type, setType] = useState('Strength');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(30);
    const [loadingWorkout, setLoadingWorkout] = useState(false);
    const [errorWorkout, setErrorWorkout] = useState('');
    const [successWorkout, setSuccessWorkout] = useState(false);

    // --- Meal Handlers ---
    const handleFileSelected = (file) => {
        if (!file) return;
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const clearImage = () => {
        setImage(null);
        setImagePreview(null);
        if (cameraInputRef.current) cameraInputRef.current.value = '';
        if (galleryInputRef.current) galleryInputRef.current.value = '';
    };

    const handleLogMeal = async () => {
        if (!name || !calories) return;
        setLoadingMeal(true);
        try {
            setErrorMeal('');
            await api.post('/meals', {
                description: name,
                calories: Math.round(calories),
                protein: Math.round(protein),
            });

            setName('');
            setCalories(0);
            setProtein(0);
            clearImage();
            setAiSuccess(false);
            setSuccessMeal(true);
            setTimeout(() => setSuccessMeal(false), 3000);
        } catch (err) {
            console.error('Error logging meal:', err);
            setErrorMeal(err.response?.data?.error || 'Failed to save meal. Check your inputs.');
        } finally {
            setLoadingMeal(false);
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
                    reader.onload = () => {
                        const parts = reader.result.split(',');
                        const mimeMatch = parts[0].match(/:(.*?);/);
                        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
                        resolve({ data: parts[1], mimeType });
                    };
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
                setProtein(response.data.protein || 0);
                setAiSuccess(true);
            }
        } catch (err) {
            console.error('AI Analysis error:', err);
            setErrorMeal('AI analysis failed. Please try again.');
        } finally {
            clearImage();
            setAnalyzing(false);
        }
    };

    // --- Workout Handlers ---
    const handleLogWorkout = async () => {
        if (!description || !duration) return;
        setLoadingWorkout(true);
        setErrorWorkout('');
        try {
            await api.post('/workouts', {
                description: `${type}: ${description}`,
                duration_minutes: duration,
            });
            setDescription('');
            setDuration(30);
            setSuccessWorkout(true);
            setTimeout(() => setSuccessWorkout(false), 3000);
        } catch (err) {
            setErrorWorkout('Failed to log workout. Please try again.');
        } finally {
            setLoadingWorkout(false);
        }
    };

    const handleUndoMeal = async () => {
        if (!window.confirm('Remove the last logged meal?')) return;
        try {
            await api.delete('/meals/last');
            setSuccessMeal(true);
            setTimeout(() => setSuccessMeal(false), 3000);
        } catch (err) {
            setErrorMeal('Failed to undo last meal.');
        }
    };

    const handleUndoWorkout = async () => {
        if (!window.confirm('Remove the last logged workout?')) return;
        try {
            await api.delete('/workouts/last');
            setSuccessWorkout(true);
            setTimeout(() => setSuccessWorkout(false), 3000);
        } catch (err) {
            setErrorWorkout('Failed to undo last workout.');
        }
    };

    return (
        <Stack gap="xl">
            <Title order={2}>Log Activity</Title>
            <Grid gutter="xl">
                {/* Meal Section */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <div className="glass-card" style={{ height: '100%' }}>
                        <Title order={3} mb="md">Log a New Meal</Title>
                        <Stack>
                            {errorMeal && <Alert color="red" mb="md" onClose={() => setErrorMeal('')} withCloseButton>{errorMeal}</Alert>}
                            {successMeal && <Alert color="teal" mb="md" icon={<IconSparkles size={16} />}>Meal logged successfully!</Alert>}
                            {aiSuccess && (
                                <Alert color="violet" mb="md" icon={<IconSparkles size={16} />}>
                                    AI estimated the calories! Review and click <b>Log Meal</b> to save.
                                </Alert>
                            )}

                            <Group grow align="flex-end">
                                <TextInput
                                    label="Meal Name or Description (grams)"
                                    placeholder="e.g. Chicken Salad (200g)"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <NumberInput
                                    label="Calories (kcal)"
                                    placeholder="0"
                                    value={calories}
                                    onChange={setCalories}
                                />
                                <NumberInput
                                    label="Protein (g)"
                                    placeholder="0"
                                    value={protein}
                                    onChange={setProtein}
                                />
                            </Group>

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
                                    Take a photo or upload one — AI will estimate the calorie content.
                                    The photo is only used for analysis and is <b>never saved</b>.
                                </Text>

                                <input
                                    ref={cameraInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    style={{ display: 'none' }}
                                    onChange={(e) => handleFileSelected(e.target.files?.[0])}
                                />
                                <input
                                    ref={galleryInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => handleFileSelected(e.target.files?.[0])}
                                />

                                {imagePreview && (
                                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
                                        <img
                                            src={imagePreview}
                                            alt="Meal preview"
                                            style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}
                                        />
                                        <ActionIcon
                                            size="xs"
                                            color="red"
                                            variant="filled"
                                            radius="xl"
                                            style={{ position: 'absolute', top: -6, right: -6 }}
                                            onClick={clearImage}
                                        >
                                            <IconX size={10} />
                                        </ActionIcon>
                                    </div>
                                )}

                                <Group gap="sm" wrap="wrap">
                                    <Button
                                        variant="light"
                                        color="violet"
                                        leftSection={<IconCamera size={16} />}
                                        onClick={() => cameraInputRef.current?.click()}
                                    >
                                        Take Photo
                                    </Button>
                                    <Button
                                        variant="subtle"
                                        color="violet"
                                        leftSection={<IconPhoto size={16} />}
                                        onClick={() => galleryInputRef.current?.click()}
                                    >
                                        Upload from Gallery
                                    </Button>
                                    <Button
                                        color="violet"
                                        leftSection={<IconSparkles size={16} />}
                                        onClick={handleAnalyzeAI}
                                        loading={analyzing}
                                        disabled={!name && !image}
                                        ml="auto"
                                    >
                                        Estimate Calories
                                    </Button>
                                </Group>
                            </div>

                            <Alert color="blue" variant="light" icon={<IconInfoCircle size={14} />} py="xs">
                                You can also type a meal description and click <b>Estimate Calories</b> without a photo.
                            </Alert>

                            <Group grow>
                                <Button
                                    color="violet"
                                    size="md"
                                    onClick={handleLogMeal}
                                    loading={loadingMeal}
                                    disabled={!name || !calories}
                                >
                                    Log Meal
                                </Button>
                                <Button
                                    variant="outline"
                                    color="gray"
                                    size="md"
                                    leftSection={<IconArrowBackUp size={16} />}
                                    onClick={handleUndoMeal}
                                    title="Undo last meal"
                                >
                                    Undo Last
                                </Button>
                            </Group>
                        </Stack>
                    </div>
                </Grid.Col>

                {/* Workout Section */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <div className="glass-card" style={{ height: '100%' }}>
                        <Title order={3} mb="md">Log a Workout</Title>
                        <Stack gap="md">
                            {errorWorkout && <Alert color="red" mb="md" onClose={() => setErrorWorkout('')} withCloseButton>{errorWorkout}</Alert>}
                            {successWorkout && <Alert color="teal" mb="md" icon={<IconSparkles size={16} />}>Workout logged successfully!</Alert>}
                            <Group grow>
                                <Select
                                    label="Workout Type"
                                    data={WORKOUT_TYPES}
                                    value={type}
                                    onChange={setType}
                                    withAsterisk
                                />
                                <NumberInput
                                    label="Duration (minutes)"
                                    placeholder="30"
                                    value={duration}
                                    onChange={setDuration}
                                    min={1}
                                    max={300}
                                    withAsterisk
                                />
                            </Group>
                            <Textarea
                                label="Notes / Description"
                                placeholder="e.g. Bench press 3x10, squats 4x8..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                minRows={4}
                                withAsterisk
                            />
                            
                            <Group grow mt="auto">
                                <Button
                                    color="violet"
                                    size="md"
                                    onClick={handleLogWorkout}
                                    loading={loadingWorkout}
                                    disabled={!description || !duration || !type}
                                >
                                    Log Workout
                                </Button>
                                <Button
                                    variant="outline"
                                    color="gray"
                                    size="md"
                                    leftSection={<IconArrowBackUp size={16} />}
                                    onClick={handleUndoWorkout}
                                    title="Undo last workout"
                                >
                                    Undo Last
                                </Button>
                            </Group>
                        </Stack>
                    </div>
                </Grid.Col>
            </Grid>
        </Stack>
    );
};

export default LogActivity;
