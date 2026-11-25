import { useEffect, useState } from 'react';
import { getServiceInfo } from './client';

// Until the backend confirms live data, assume demo: we'd rather under-promise
// than present sample prices as real ones.
const ASSUMED = { demo_mode: true, providers: [], loaded: false };

export default function useServiceInfo() {
  const [info, setInfo] = useState(ASSUMED);

  useEffect(() => {
    let active = true;
    getServiceInfo()
      .then((data) => active && setInfo({ ...data, loaded: true }))
      .catch(() => active && setInfo({ ...ASSUMED, loaded: true, failed: true }));
    return () => {
      active = false;
    };
  }, []);

  return info;
}
