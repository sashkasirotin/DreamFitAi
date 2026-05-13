import React, { useState, useEffect } from 'react';
import { Title, Text, Stack, Group, Loader, Anchor, Badge, ScrollArea } from '@mantine/core';
import { IconNews } from '@tabler/icons-react';
import api from '../api';

const FitnessNewsWidget = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await api.get('/news');
                const data = response.data;
                if (data.status === 'ok') {
                    setNews(data.articles.filter(article => article.title && article.url));
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("News API error:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    return (
        <div className="glass-card" style={{ padding: '20px' }}>
            <Group justify="space-between" mb="md">
                <Group gap="xs">
                    <IconNews size={20} color="var(--mantine-color-cyan-filled)" />
                    <Title order={4}>Latest Fitness News</Title>
                </Group>
                <Badge color="cyan" variant="light" size="sm">Live</Badge>
            </Group>

            {loading ? (
                <Stack align="center" py="xl">
                    <Loader size="sm" color="cyan" type="dots" />
                </Stack>
            ) : error || news.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" py="sm">
                    Could not load latest news at this time.
                </Text>
            ) : (
                <ScrollArea h={300} offsetScrollbars>
                    <Stack gap="md" pr="sm">
                        {news.map((article, i) => (
                            <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                                <Anchor href={article.url} target="_blank" c="gray.1" underline="hover">
                                    <Text size="sm" fw={600} lineClamp={2} style={{ lineHeight: 1.4 }}>
                                        {article.title}
                                    </Text>
                                </Anchor>
                                <Group justify="space-between" mt={6}>
                                    <Badge color="dark" size="xs" variant="filled" style={{ textTransform: 'none' }}>
                                        {article.source.name}
                                    </Badge>
                                    <Text size="xs" c="dimmed" fw={500}>
                                        {new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </Text>
                                </Group>
                            </div>
                        ))}
                    </Stack>
                </ScrollArea>
            )}
        </div>
    );
};

export default FitnessNewsWidget;
