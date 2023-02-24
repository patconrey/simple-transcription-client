/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useErrorStatus } from "./ErrorHandler";

// COULD BENEFIT FROM SOME CACHING ON CERTAIN ROUTES
export const useQuery = ({ url }) => {
	const { setErrorStatusCode } = useErrorStatus();
	const [apiData, setApiData] = useState();

	useEffect(() => {
		fetch(url)
			.then(data => {
				if (data.status !== 200) {
					throw new Error(data.status)
				}
				return data.json()
			})
			.then((dataJson) => {
				const { data } = dataJson
				setApiData(data?.data)
			}, (reasonCode) => {
				setErrorStatusCode(reasonCode.message)
			});
	}, [url]);

	return { data: apiData}
}

export default useQuery