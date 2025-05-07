import { Link } from 'react-router-dom';
import className from 'classnames/bind';
import styles from './Sidebar.module.scss';
// import { useState } from 'react';
import { DashboardIcon, HeadsetIcon, ListIcon, UserIcon, SongIcon } from '~/components/Icons';

const cx = className.bind(styles);

const Sidebar = () => {
    // const [stateProduct, setStateProduct] = useState(['Dashboard']);
    // useEffect(() => {
    //     axios
    //         .get('http://localhost:9000/category')
    //         .then((res) => {
    //             setStateProduct(res.data.categories);
    //         })
    //         .catch((error) => {
    //             console.log(error.message);
    //         });
    // }, []);

    return (
        <div className={cx('sidebar')}>
            <div className={cx('categories-shop')}>
                <div className={cx('logo')} >
                    Spotify
                </div>
                <ul className={cx('categories-admin')}>
                    <li className={cx('category-wrap')}>
                        <div className={cx('category-item')}>
                            <DashboardIcon />
                            <Link className={cx('title-category-admin')} to={'/'} name="">
                                Dashboard
                            </Link>
                        </div>
                    </li>
                    <li className={cx('category-wrap')}>
                        <div className={cx('category-item')}>
                            <SongIcon />
                            <Link className={cx('title-category-admin')} to={'/songs'} name="">
                                Songs
                            </Link>
                        </div>
                    </li>
                    <li className={cx('category-wrap')}>
                        <div className={cx('category-item')}>
                            <HeadsetIcon />
                            <Link className={cx('title-category-admin')} to={'/artists'} name="">
                                Artists
                            </Link>
                        </div>
                    </li>
                    <li className={cx('category-wrap')}>
                        <div className={cx('category-item')}>
                            <ListIcon />
                            <Link className={cx('title-category-admin')} to={'/genres'} name="">
                                Genres
                            </Link>
                        </div>
                    </li>
                    <li className={cx('category-wrap')}>
                        <div className={cx('category-item')}>
                            <UserIcon/>
                            <Link className={cx('title-category-admin')} to={'/users'} name="">
                                Customers
                            </Link>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default Sidebar;
