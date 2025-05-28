import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import className from 'classnames/bind';
import styles from './Home.module.scss';
import { Bar } from 'react-chartjs-2';
import * as request from '~/utils/request';
import { UserIcon, HeadsetIcon, SongIcon, MessageIcon } from '~/components/Icons';
import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
    BarElement,
    BarController,
} from 'chart.js';

Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
    BarElement,
    BarController,
);

const cx = className.bind(styles);

const Home = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState(0);
    const [songs, setSongs] = useState(0);
    const [genres, setGenres] = useState(0);
    const [messages, setMessages] = useState(0);
    const [topSongsChart, setTopSongsChart] = useState(null);
    const [topSongs, setTopSongs] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const res = await request.get(`/api/admin/system-stats/`);
                setUsers(res.data.total_users);
                setSongs(res.data.total_songs);
                setGenres(res.data.total_genres);
                setMessages(res.data.total_messages);
            } catch (error) {
                if (error.response.status === 401) navigate('/login');
            }
        })();
    }, [navigate]);

    useEffect(() => {
        (async () => {
            try {
                const res = await request.get(`/api/admin/songs/top-popular/`);
                setTopSongsChart(res.data);
            } catch (error) {
                if (error.response.status === 401) navigate('/login');
            }
        })();
    }, [navigate]);

    useEffect(() => {
        (async () => {
            try {
                const res = await request.get(`/api/admin/songs/top/`);
                setTopSongs(res);
            } catch (error) {
                if (error.response.status === 401) navigate('/login');
            }
        })();
    }, [navigate]);

    return (
        <div className={cx('container_m')}>
            <div className={cx('mt-4', 'mb-4', 'pd-top-20px')}>
                <div className={cx('content-page')}>
                    <div className={cx('row')}>
                        <div className={cx('col', 'col-3', 'col-4', 'col-6', 'col-12', 'mb-24')}>
                            <div className={cx('total-order-wrap')}>
                                <div className={cx('icon-cart')}>
                                    <UserIcon width="20" />
                                </div>
                                <div className={cx('order-admin')}>
                                    <h6 className={cx('total-order-title')}>Total users</h6>
                                    <p className={cx('total')}>{users || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className={cx('col', 'col-3', 'col-4', 'col-6', 'col-12', 'mb-24')}>
                            <div className={cx('total-order-wrap')}>
                                <div className={cx('icon-rounded')}>
                                    <SongIcon width="20" />
                                </div>
                                <div className={cx('order-admin')}>
                                    <h6 className={cx('total-order-title')}>Total songs</h6>
                                    <p className={cx('total')}>{songs || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className={cx('col', 'col-3', 'col-4', 'col-6', 'col-12', 'mb-24')}>
                            <div className={cx('total-order-wrap')}>
                                <div className={cx('icon-processing')}>
                                    <HeadsetIcon width="20" />
                                </div>
                                <div className={cx('order-admin')}>
                                    <h6 className={cx('total-order-title')}>Total genres</h6>
                                    <p className={cx('total')}>{genres || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className={cx('col', 'col-3', 'col-4', 'col-6', 'col-12', 'mb-24')}>
                            <div className={cx('total-order-wrap')}>
                                <div className={cx('icon-tick')}>
                                    <MessageIcon width="20" />
                                </div>
                                <div className={cx('order-admin')}>
                                    <h6 className={cx('total-order-title')}>Total messages</h6>
                                    <p className={cx('total')}>{messages || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {topSongsChart && (
                    <div className={cx('order-statistics', 'mb-24')}>
                        <p className={cx('order-statistics-title')}>Top 5 popular songs</p>
                        <Bar
                            data={{
                                labels: topSongsChart.labels,
                                datasets: topSongsChart.datasets,
                            }}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        display: true,
                                        position: 'top',
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function (context) {
                                                const artist = topSongsChart.datasets[0].artists[context.dataIndex];
                                                return `${context.dataset.label}: ${context.raw} (by ${artist})`;
                                            },
                                        },
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                    },
                                },
                            }}
                        />
                    </div>
                )}

                <div className={cx('table-wrap', 'mb-24')}>
                    <div className={cx('table-container')}>
                        <table
                            className={cx('table')}
                            style={{
                                borderCollapse: 'separate',
                                borderSpacing: 0,
                                borderRadius: '10px',
                                overflow: 'hidden',
                                width: '100%',
                                border: '1px solid #ccc',
                            }}
                        >
                            <thead>
                                <tr>
                                    <th scope="col" style={{ textAlign: 'center', padding: '12px' }}>
                                        Top
                                    </th>
                                    <th scope="col" style={{ padding: '12px' }}>
                                        Image
                                    </th>
                                    <th scope="col" style={{ padding: '12px' }}>
                                        Name
                                    </th>
                                    <th scope="col" style={{ padding: '12px' }}>
                                        Artist
                                    </th>
                                    <th scope="col" style={{ textAlign: 'center', padding: '12px' }}>
                                        Genre
                                    </th>
                                    <th scope="col" style={{ textAlign: 'center', padding: '12px' }}>
                                        Release date
                                    </th>
                                    <th scope="col" style={{ textAlign: 'center', padding: '12px' }}>
                                        Play count
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {topSongs.length > 0 &&
                                    topSongs.map((song, index) => (
                                        <tr key={song.id}>
                                            <td style={{ textAlign: 'center'}}>
                                                {index + 1}
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                {song.image && (
                                                    <img
                                                        src={song.image}
                                                        alt={song.title}
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                    />
                                                )}
                                            </td>
                                            <td style={{ padding: '12px' }}>{song.title}</td>
                                            <td style={{ padding: '12px' }}>{song.artist_info.name}</td>
                                            <td style={{ textAlign: 'center', padding: '12px' }}>
                                                {song.genre_info.name}
                                            </td>
                                            <td style={{ textAlign: 'center', padding: '12px' }}>
                                                {song.release_date}
                                            </td>
                                            <td style={{ textAlign: 'center', padding: '12px' }}>{song.play_count}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
