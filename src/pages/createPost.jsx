import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import '../styles/createPost.css';
import ImageUrlUploader from '../components/imageUrlUploader';
const pagesHelper = require('../components/helpers/pagesHelpers');
const instagramHelper = require('../components/helpers/instagramHelpers');
const threadsHelper = require('../components/helpers/threadsHelpers');

const CreatePost = () => {
    const [accountType, setAccountType] = useState('');
    const { pageId } = useParams();
    console.log('CreatePost pageId:', pageId);

    const { accountId } = useParams();
    console.log('CreatePost accountId:', accountId);

    const { threadsId } = useParams();
    console.log('CreatePost threadsId:', threadsId);

    useEffect(() => {
        if (pageId) {
            setAccountType('Page');
        } else if (accountId) {
            setAccountType('Instagram');
        } else if (threadsId) {
            setAccountType('Threads');
        }
    }, [pageId, accountId, threadsId]);

    const [imageResetKey, setImageResetKey] = useState(0);
    const [activeTab, setActiveTab] = useState('image');
    const [imageUrl, setImageUrl] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [error, setError] = useState(null);

    const [isLoading, setIsLoading] = useState(false);

    const handleGoBack = () => {
        window.history.back();
    }

    useEffect(() => {
        console.log('image url:', imageUrl);
    }, [imageUrl]);

    const handleFormSubmit = async (e) => {
        
        e.preventDefault();

        const form = e.target;
        
        const formData = new FormData(e.target);
        const message = formData.get('message');
        
        console.log('Form submitted:', { 
            message, 
            type: activeTab,
            image: activeTab === 'image' ? imageUrl : null,
            link: activeTab === 'link' ? linkUrl : null
        });

        let response;
        let body;
        try {
            setIsLoading(true);
            switch (activeTab) {
                
                case 'link':
                    if (!linkUrl) {
                        setError('Please enter a valid URL.');
                        return;
                    }
                    body = {
                        link: linkUrl,
                        message: message,
                    };
                    if (accountType === 'Instagram') {
                        setError('Instagram does not support link posts.');
                        return;
                    }
                    if (accountType === 'Threads') {
                        let threadsBody = {
                            data: linkUrl,
                            text: message,
                            type: 'LINK'
                        }
                        response = await threadsHelper.postThreads(threadsId, threadsBody);
                        break;
                    }
                    response = await pagesHelper.postLinkToFacebookPage(pageId, body);
                    break;
                
                case 'image':
                    if (!imageUrl) {
                        setError('Please enter a valid image URL.');
                        return;
                    }
                    body = {
                        message: message,
                        imageUrl: imageUrl,
                    }
                    if (accountType === 'Instagram') {
                        response = await instagramHelper.postImageToInstagram(accountId, body);
                        break;
                    }
                    if (accountType === 'Threads') {
                        let threadsBody = {
                            data: imageUrl,
                            text: message,
                            type: 'IMAGE'
                        }
                        response = await threadsHelper.postThreads(threadsId, threadsBody);
                        break;
                    }
                    response = await pagesHelper.postImageToFacebookPage(pageId, body);
                    break;

                default:
                    setError('Invalid post type selected.');
                    return;
            }
            console.log('Post response:', response);
            if (response.status === 'error') {
                toast.error(response.message);
                return;
            }
            toast.success('Post created successfully!');
            setImageResetKey(prevKey => prevKey + 1);
            setImageUrl('');
            setLinkUrl('');

            form.reset();
            setActiveTab('image');
        } catch (err) {
            console.error('Error creating post:', err);
            toast.error('Failed to create post. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="create-post-container">
            <div className="header-row">
                <button 
                    className="back-button" 
                    onClick={handleGoBack}
                    type="button"
                >
                    ← Back
                </button>
                <h1>Creating Post for {accountType}</h1>
                <div className="spacer"></div>
            </div>
            <div className="tab-container">
                <button 
                    type="button"
                    className={`tab-button ${activeTab === 'image' ? 'active' : ''}`}
                    onClick={() => setActiveTab('image')}
                >
                    Image
                </button>
                {(accountType === 'Page' || accountType === 'Threads') && (
                    <button 
                        type="button"
                        className={`tab-button ${activeTab === 'link' ? 'active' : ''}`}
                        onClick={() => setActiveTab('link')}
                    >
                        Link
                    </button>
                )}
            </div>
            <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                    {activeTab === 'image' ? (
                        <>
                            <ImageUrlUploader 
                            onImageSelect={(url) => {
                                setImageUrl(url);
                                setError(null);
                            }}
                            resetKey={imageResetKey}
                            />
                        </>
                    ) : (
                        <>
                            <label htmlFor="linkUrl">URL:</label>
                            <input 
                                type="url" 
                                id="linkUrl" 
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://example.com/your-link"
                            />
                        </>
                    )}
                    
                    {error && <p className="error">{error}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="message">Message:</label>
                    <textarea id="message" name="message" required></textarea>
                </div>
                <button 
                    disabled={(!imageUrl && !linkUrl) || isLoading} 
                    type="submit"
                >
                    Submit
                </button>
            </form>
            
        </div>
    );
}

export default CreatePost;