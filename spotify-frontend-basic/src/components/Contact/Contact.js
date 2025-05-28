import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Contact.module.scss';
import request from '~/utils/request';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

const Contact = ({ onSelectContact, searchQuery }) => {
    const [contacts, setContacts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await request.get(`/api/users`);
                setContacts(res.data);
            } catch (error) {
                if (error.response?.status === 401) navigate('/login');
            }
        };
        fetchUsers();
    }, [navigate]);

    useEffect(() => {
        const fetchFilteredContacts = async () => {
            try {
                const res = await request.get(`/api/users`, { params: { search: searchQuery } });
                setContacts(res.data);
            } catch (error) {
                if (error.response?.status === 401) navigate('/login');
            }
        };
        fetchFilteredContacts()
    }, [searchQuery, navigate]);

    return (
        <>
            {contacts.length > 0 &&
                contacts.map((result) => (
                    <div className={cx('contact')} key={result._id} onClick={() => onSelectContact(result)}>
                        <img alt="" height="40" src={result.profilePic} width="40" />
                        <div className={cx('name')}>{result.fullName}</div>
                    </div>
                ))}
        </>
    );
};

export default Contact;
