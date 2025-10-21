import { useState, useEffect } from 'react';

const useGeolocation = () => {
    const [location, setLocation] = useState({ 
        loaded: false, 
        coordinates: { lat: null, lng: null },
        error: null,
    });

    const onSuccess = (location) => {
        setLocation({
            loaded: true,
            coordinates: {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
            },
            error: null,
        });
    };

    const onError = (error) => {
        setLocation({ loaded: true, coordinates: { lat: null, lng: null }, error });
    };

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            onError({ code: 0, message: "Geolocation not supported in your browser" });
            return;
        }
        // Ask for permission
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }, []);

    return location;
};

export default useGeolocation;