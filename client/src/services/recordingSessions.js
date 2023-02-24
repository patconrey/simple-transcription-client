export function getUserRecordingSessions() {
	return fetch('/api/v1/recording-sessions/')
		.then(data => data.json())
}

export function setRecordingSession(sessionObject) {
	return fetch('/api/v1/recording-sessions/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(sessionObject)
	})
		.then(data => data.json())
}

export function getOneRecordingSession(sessionId) {
	return fetch(`/api/v1/recording-sessions/${sessionId}`)
		.then(data => data.json()) 
}

export function markSessionAsBegun(sessionId) {
	return fetch(`/api/v1/recording-sessions/${sessionId}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			hasSessionBegun: true,
		})
	})
		.then(data => data.json())
}

export function markSessionAsConfirmed(sessionId) {
	return fetch(`/api/v1/recording-sessions/${sessionId}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			isConfirmed: true,
		})
	})
		.then(data => data.json())
}

export function markSessionAsCanceled(sessionId) {
	return fetch(`/api/v1/recording-sessions/${sessionId}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			isCanceled: true,
		})
	})
		.then(data => data.json())
}