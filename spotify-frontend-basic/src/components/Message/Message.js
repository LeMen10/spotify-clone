import { useState, useEffect, useRef } from 'react';
import className from 'classnames/bind';
import styles from './Message.module.scss';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSmile, faClose } from '@fortawesome/free-solid-svg-icons';
import EmojiPicker from 'emoji-picker-react';
import request from '~/utils/request';
import Cookies from 'js-cookie';

const cx = className.bind(styles);

const Message = ({ setCheckOnClickChat }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState();
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [messages, setMessages] = useState([]);
    const [messageContent, setMessageContent] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const [conversationId, setConversationId] = useState(null);
    const [socket, setSocket] = useState();

    useEffect(() => {
        const token = Cookies.get('token');
        const wsUrl = `ws://localhost:8000/ws/chat/General/`;

        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            socket.send(
                JSON.stringify({
                    type: 'auth',
                    token: token,
                }),
            );
            setSocket(socket);
        };

        socket.onclose = () => {
            setSocket(null);
        };

        socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        return () => {
            socket.close();
        };
    }, [conversationId]);

    useEffect(() => {
        if (!socket) return;

        const handleSocketMessage = (event) => {
            const data = JSON.parse(event.data);
            if (JSON.parse(event.data).error === 'Missing required fields in message data') return;
            setMessages((prev) => [
                ...prev,
                {
                    id: data.message_id,
                    content: data.message,
                    sender_id: data.sender_id,
                    timestamp: data.timestamp,
                    fullname: data.sender_fullname,
                    profile_pic: data.profile_pic || 'https://placehold.co/30x30',
                },
            ]);
        };

        socket.onmessage = handleSocketMessage;
        return () => {
            socket.onmessage = null;
        };
    }, [socket]);

    useEffect(() => {
        setIsLoadingMessages(true);
        (async () => {
            try {
                const res = await request.get(`/api/message/get-messages-general-chat`);
                setMessages(res.data.messages);
            } catch (error) {
                if (error.response?.status === 401) navigate('/login');
            } finally {
                setTimeout(() => {
                    setIsLoadingMessages(false);
                }, 1000);
            }
        })();
    }, [navigate]);

    useEffect(() => {
        (async () => {
            try {
                const res = await request.get(`/api/user/get-user`);
                setUser(res.data.user);
            } catch (error) {}
        })();
    }, [navigate]);

    useEffect(() => {
        (async () => {
            try {
                const res = await request.get(`/api/conversation/get-conversation`);
                setConversationId(res.data[0].id);
            } catch (error) {}
        })();
    }, []);

    const sendMessage = async () => {
        if (showEmojiPicker) setShowEmojiPicker(false);
        if (!messageContent.trim() || !user || !conversationId) return;

        const messageData = {
            message: messageContent.trim(),
            sender_id: user.id,
            conversation_id: conversationId,
        };

        try {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(messageData));
                setMessageContent('');
            } else {
                console.error('WebSocket is not connected');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleEmojiClick = (emojiObject) => {
        const input = inputRef.current;
        if (!input) return;

        const start = input.selectionStart;
        const end = input.selectionEnd;
        const textBefore = messageContent.substring(0, start);
        const textAfter = messageContent.substring(end);
        const newText = textBefore + emojiObject.emoji + textAfter;

        setMessageContent(newText);
        setTimeout(() => {
            input.focus();
            input.setSelectionRange(start + emojiObject.emoji.length, start + emojiObject.emoji.length);
        }, 0);
    };

    const handleSelectMessage = (id) => {
        setSelectedMessageId(selectedMessageId === id ? null : id);
    };

    const closeMessage = () => {
        setCheckOnClickChat((prev) => !prev);
    };

    useEffect(() => {
        if (!isLoadingMessages) {
            requestAnimationFrame(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
            });
        }
    }, [messages, isLoadingMessages]);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')}>
                <div className={cx('main')}>
                    <div className={cx('chat-container')}>
                        <div className={cx('header')}>
                            <span>General chat</span>
                            <FontAwesomeIcon className={cx('faClose-message')} icon={faClose} onClick={closeMessage} />
                        </div>
                        <div className={cx('messages')}>
                            {isLoadingMessages ? (
                                <div className={cx('spinner-wr')}>
                                    <div className={cx('spinner')}></div>
                                </div>
                            ) : (
                                messages.length > 0 &&
                                messages.map((msg) => (
                                    <div key={msg.id} onClick={() => handleSelectMessage(msg.id)}>
                                        {selectedMessageId === msg.id && (
                                            <span className={cx('timestamp')}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        )}
                                        <div
                                            className={cx(
                                                'message',
                                                msg.sender_id === parseInt(user.id) ? 'sent' : 'received',
                                            )}
                                        >
                                            {msg.sender_id !== parseInt(user.id) ? (
                                                <>
                                                    <span className={cx('full-name')}>
                                                        {msg.fullname.trim().split(' ').pop()}
                                                    </span>
                                                    <div className={cx('msg-wr')}>
                                                        <img
                                                            alt="User profile"
                                                            src={msg.profile_pic || 'https://placehold.co/30x30'}
                                                        />
                                                        <span className={cx('text')}>{msg.content}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <span className={cx('text')}>{msg.content}</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}

                            <div ref={messagesEndRef}></div>
                        </div>

                        <div className={cx('input-container')}>
                            <input
                                placeholder="Aa"
                                type="text"
                                ref={inputRef}
                                onFocus={() => {
                                    if (showEmojiPicker) setShowEmojiPicker(!showEmojiPicker);
                                }}
                                onChange={(e) => {
                                    setMessageContent(e.target.value);
                                }}
                                value={messageContent}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        sendMessage();
                                    }
                                }}
                            />
                            <FontAwesomeIcon
                                className={cx('icon-smile')}
                                icon={faSmile}
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            />

                            {showEmojiPicker && (
                                <div className={cx('emoji-picker-container')}>
                                    <EmojiPicker
                                        previewConfig={{ showPreview: false }}
                                        searchDisabled={true}
                                        skinTonesDisabled={true}
                                        onEmojiClick={handleEmojiClick}
                                        height="300px"
                                        theme="dark"
                                    />
                                </div>
                            )}
                            <FontAwesomeIcon
                                className={cx('icon-paper-plane')}
                                icon={faPaperPlane}
                                onClick={sendMessage}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Message;
