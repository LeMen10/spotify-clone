import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Search.module.scss';

const cx = classNames.bind(styles);

const Search = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        onSearch(debouncedSearch);
    }, [debouncedSearch, onSearch]);

    return (
        <div className={cx('search')}>
            <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
    );
};

export default Search;
