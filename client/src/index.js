import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { Buffer } from 'buffer';
import process from 'process';

import Home from './Pages/Home'
// import VADPage from './Pages/VAD';

import ErrorBoundary from './ErrorBoundary';
import ErrorHandler from './ErrorHandler';
import ScrollToTop from './ScrollToTop';

window.Buffer = Buffer;
window.process = process

const CompleteApp = () => {
    return (
        <React.StrictMode>
            <ErrorBoundary>
                    <BrowserRouter>
                        <ErrorHandler>
                            <ScrollToTop>
                                <Routes>
                                    {/* <Route path="/" element={<VADPage />} /> */}
                                    <Route path="/" element={<Home />} />
                                </Routes>
                            </ScrollToTop>
                        </ErrorHandler>
                    </BrowserRouter>
            </ErrorBoundary>
        </React.StrictMode>
    )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
    <CompleteApp />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
