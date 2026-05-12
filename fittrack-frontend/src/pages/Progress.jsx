import React, { useState, useEffect } from 'react';
import { Title, Text, Table, Badge, Stack, Group, NumberInput, Button, Alert, Grid, Center, FileInput, Image, SimpleGrid, Modal, Timeline, ThemeIcon } from '@mantine/core';
import { IconPhoto, IconPrinter, IconSparkles, IconCheck, IconTarget } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api';

const Progress = () => {
    const [entries, setEntries] = useState([]);
    const [weight, setWeight] = useState('');
    const [bodyFat, setBodyFat] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [generatingStory, setGeneratingStory] = useState(false);
    const [story, setStory] = useState(null);
    const [usage, setUsage] = useState(null);
    const [storyOpened, { open: openStory, close: closeStory }] = useDisclosure(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProgress();
    }, []);

    const fetchProgress = async () => {
        setLoading(true);
        try {
            const res = await api.get('/progress');
            setEntries(res.data);
        } catch {
            setEntries([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!weight) return;
        setSaving(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('weight', Number(weight));
            if (bodyFat) formData.append('body_fat', Number(bodyFat));
            if (image) formData.append('image', image);

            await api.post('/progress', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setWeight('');
            setBodyFat('');
            setImage(null);
            fetchProgress();
        } catch (err) {
            console.error('Save progress error:', err);
            setError(err.response?.data?.error || 'Could not save progress. Check if an image was provided and valid.');
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateStory = async () => {
        setGeneratingStory(true);
        setError('');
        try {
            const res = await api.post('/story/generate');
            setStory(res.data);
            if (res.data._usage) setUsage(res.data._usage);
            openStory();
        } catch (err) {
            console.error('Failed to generate story', err);
            setError(err.response?.data?.error || 'Could not generate your journey story. Try logging more photos!');
        } finally {
            setGeneratingStory(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const chartData = [...entries].reverse().map(e => ({
        date: new Date(e.created_at || e.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        weight: Number(e.weight)
    }));

    const latest = entries[0];
    const initial = entries[entries.length - 1];
    const weightChange = latest && initial ? (latest.weight - initial.weight).toFixed(1) : null;
    const photos = entries.filter(e => e.photo_url);

    return (
        <Stack gap="xl">
            <Group justify="space-between">
                <Title order={1}>Your Progress</Title>
                <Group className="no-print">
                    <Button 
                        color="violet" 
                        variant="light"
                        leftSection={<IconSparkles size={16} />}
                        onClick={handleGenerateStory}
                        loading={generatingStory}
                        disabled={photos.length === 0}
                    >
                        My Journey Story
                    </Button>
                    <Button 
                        variant="light" 
                        color="gray" 
                        leftSection={<IconPrinter size={16} />}
                        onClick={handlePrint}
                    >
                        Print Report
                    </Button>
                </Group>
            </Group>

            <Modal 
                opened={storyOpened} 
                onClose={closeStory} 
                title={<Group><IconSparkles color="var(--mantine-color-violet-filled)" /><Text fw={700}>Your Fitness Journey</Text></Group>}
                size="lg"
                radius="md"
            >
                {story && (
                    <Stack gap="xl">
                        <div className="dashboard-hero" style={{ padding: '20px' }}>
                            <Title order={2} mb="sm">{story.title}</Title>
                            <Text size="sm" style={{ fontStyle: 'italic', opacity: 0.9 }}>
                                {story.full_story}
                            </Text>
                        </div>

                        <Timeline active={story.segments.length - 1} bulletSize={24} lineWidth={2}>
                            {story.segments.map((seg, i) => (
                                <Timeline.Item 
                                    key={i} 
                                    bullet={<IconTarget size={12} />} 
                                    title={seg.caption}
                                >
                                    <Grid mt="xs">
                                        <Grid.Col span={4}>
                                            <Image src={seg.photo_url} radius="md" />
                                        </Grid.Col>
                                        <Grid.Col span={8}>
                                            <Text size="sm" c="dimmed">{seg.segment_text}</Text>
                                        </Grid.Col>
                                    </Grid>
                                </Timeline.Item>
                            ))}
                        </Timeline>

                        <div className="glass-card">
                            <Title order={4} mb="md">Key Wins</Title>
                            <Group>
                                {story.key_wins.map((win, i) => (
                                    <Badge key={i} color="teal" variant="light" leftSection={<IconCheck size={10} />}>
                                        {win}
                                    </Badge>
                                ))}
                            </Group>
                        </div>

                        {usage && (
                            <Text size="10px" ta="right" c="dimmed">
                                AI Tokens: {usage.totalTokenCount} ({usage.promptTokenCount} in / {usage.candidatesTokenCount} out)
                            </Text>
                        )}
                    </Stack>
                )}
            </Modal>

            <Grid className="no-print">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <div className="glass-card" style={{ height: 400 }}>
                        <Title order={4} mb="xl">Weight Trend</Title>
                        {entries.length < 2 ? (
                            <Center h={300}>
                                <Text c="dimmed">Log at least 2 entries to see your trend chart</Text>
                            </Center>
                        ) : (
                            <ResponsiveContainer width="100%" height="85%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis 
                                        dataKey="date" 
                                        stroke="rgba(255,255,255,0.4)" 
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis 
                                        stroke="rgba(255,255,255,0.4)" 
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        domain={['dataMin - 2', 'dataMax + 2']}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'rgba(25,20,35,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="weight" 
                                        stroke="#7950f2" 
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#7950f2', strokeWidth: 2 }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack gap="md" h="100%">
                        <div className="glass-card">
                            <Title order={4} mb="md">Log Stats</Title>
                            <Stack gap="sm">
                                <NumberInput
                                    label="Weight (kg)"
                                    placeholder="e.g. 78.5"
                                    value={weight}
                                    onChange={setWeight}
                                    decimalScale={1}
                                />
                                <NumberInput
                                    label="Body Fat %"
                                    placeholder="optional"
                                    value={bodyFat}
                                    onChange={setBodyFat}
                                    decimalScale={1}
                                />
                                <FileInput 
                                    label="Progress Photo"
                                    placeholder="Take a picture"
                                    leftSection={<IconPhoto size={14} />}
                                    value={image}
                                    onChange={setImage}
                                    accept="image/*"
                                />
                                <Button color="violet" fullWidth onClick={handleSave} loading={saving} disabled={!weight}>
                                    Save Entry
                                </Button>
                            </Stack>
                            {error && <Alert color="orange" mt="sm">{error}</Alert>}
                        </div>
                        
                        {weightChange !== null && (
                            <div className="glass-card" style={{ flex: 1 }}>
                                <Text size="sm" c="dimmed" fw={700} tt="uppercase">Total Change</Text>
                                <Group align="flex-end" gap="xs" mt={5}>
                                    <Title order={2}>{weightChange > 0 ? `+${weightChange}` : weightChange} kg</Title>
                                    <Badge color={Number(weightChange) <= 0 ? 'teal' : 'red'} variant="light">
                                        {Number(weightChange) <= 0 ? 'Lost' : 'Gained'}
                                    </Badge>
                                </Group>
                                <Text size="xs" c="dimmed" mt={7}>Current: {latest?.weight} kg</Text>
                            </div>
                        )}
                    </Stack>
                </Grid.Col>
            </Grid>

            {photos.length > 0 && (
                <div>
                    <Title order={2} mb="md">Transformation Gallery</Title>
                    <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md">
                        {photos.map((p, i) => (
                            <div key={i} className="glass-card" style={{ padding: 4 }}>
                                <Image 
                                    src={p.photo_url} 
                                    radius="sm" 
                                    h={200} 
                                    fallbackSrc="https://placehold.co/400x600?text=No+Photo"
                                    style={{ objectFit: 'cover' }}
                                />
                                <Text size="xs" ta="center" mt={5} c="dimmed">
                                    {new Date(p.created_at).toLocaleDateString()}
                                </Text>
                                <Text size="xs" ta="center" fw={700}>
                                    {p.weight} kg
                                </Text>
                            </div>
                        ))}
                    </SimpleGrid>
                </div>
            )}

            <div>
                <Title order={2} mb="md">History</Title>
                <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    {entries.length === 0 ? (
                        <Text c="dimmed" size="sm" p="xl">No progress entries yet. Log your first entry above!</Text>
                    ) : (
                        <Table verticalSpacing="md" highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Date</Table.Th>
                                    <Table.Th>Weight (kg)</Table.Th>
                                    <Table.Th>Body Fat (%)</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {entries.map((entry, i) => (
                                    <Table.Tr key={i}>
                                        <Table.Td>{new Date(entry.created_at || entry.date).toLocaleDateString()}</Table.Td>
                                        <Table.Td fw={500}>{entry.weight}</Table.Td>
                                        <Table.Td>{entry.body_fat ?? entry.bodyFat ?? '—'}%</Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    )}
                </div>
            </div>
        </Stack>
    );
};

export default Progress;
