export function getMe() {
	const potentialUser = localStorage.getItem('user');
	if (potentialUser) {
		return JSON.parse(potentialUser)
	}

	return fetch('/api/v1/users/me')
		.then(data => data.json())
}

export function loginUser(credentials) {
	return fetch('/api/v1/users/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(credentials)
	})
		.then(data => {
			if (data.status !== 200) {
				throw new Error(data.status)
			}
			return data.json()
		})
		.then(dataJson => {
			if (dataJson.error) {
				return {
					user: null,
					errorMessage: dataJson.message,
				}
			}
			const { data } = dataJson
			const { user } = data
			localStorage.setItem('user', JSON.stringify(user));

			return {
				user,
				errorMessage: null
			}
		}, (error) => {
			try {
				const statusCode = parseInt(error.message)
				let reasonForFail = 'Internal server error.'
				if (statusCode === 401) {
					reasonForFail = 'Incorrect email or password.'
				}
				else if (statusCode === 400) {
					reasonForFail = 'Please provide both an email and a password.'
				}
				return {
					user: null,
					errorMessage: reasonForFail
				}
			} catch (error) {
				console.log('Sign in error', error)
				return {
					user: null,
					errorMessage: null,
				}
			}
		})
}

export function signUp(credentials) {
	return fetch('/api/v1/users/signup', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(credentials)
	})
		.then(data => {
			return data.json()
		})
		.then(dataJson => {
			if (dataJson.status === 'fail') {
				throw new Error(dataJson.message)
			}

			if (process.env.NODE_ENV === 'development') {
				if (dataJson.error && dataJson.error.errors) {
					const fieldsWithErrors = Object.keys(dataJson.error.errors)
					if (fieldsWithErrors.length > 0) {
						const errorMessage = dataJson.error.errors[fieldsWithErrors[0]].message
						
						return {
							user: null,
							errorMessage,
						}
					}
				}
				if (dataJson.error && dataJson.error.code && dataJson.error.code === 11000) {
					return {
						user: null,
						errorMessage: 'An account with that email already exists.',
					}
				}
				if (dataJson.error && dataJson.error.code && dataJson.error.code === 500) {
					return {
						user: null,
						errorMessage: 'An internal error occurred.',
					}
				}
			}
			
			const { data } = dataJson
			const { user } = data
			localStorage.setItem('user', JSON.stringify(user));

			return {
				user,
				errorMessage: null
			}
		})
		.then((successObject) => {
			return successObject
		}, (error) => {
			return {
				user: null,
				errorMessage: error.message
			}
		})
}

// LOGIN AND SAVE USER OBJECT