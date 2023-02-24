import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

const ErrorStatusContext = React.createContext();

const ErrorHandler = ({ children }) => {
	const [errorStatusCode, setErrorStatusCode] = useState(null)
	let location = useLocation();
	
	useEffect(() => {
		return () => setErrorStatusCode(null)
	}, [location.pathname])

	const renderContent = () => {
		if (errorStatusCode) {
			const statusCode = parseInt(errorStatusCode)
			if (statusCode === 401) {
				return null;
				// return <SignIn onSuccess={() => setErrorStatusCode(null)} />
			}
			return <h1>ERROR {errorStatusCode}</h1>
		}

		return children
	}

	const contextPayload = useMemo(
		() => ({ setErrorStatusCode }),
		[setErrorStatusCode]
	);

	return (
		<ErrorStatusContext.Provider value={contextPayload}>
			{renderContent()}
		</ErrorStatusContext.Provider>
	)
}

export const useErrorStatus = () => useContext(ErrorStatusContext);

export default ErrorHandler
