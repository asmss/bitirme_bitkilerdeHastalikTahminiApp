import React, { createContext, useState } from 'react';
import api from '../services/api';

export const KayitContext = createContext();

export const KayitProvider = ({ children }) => {
    const [sohbetler, setSohbetler] = useState([]);
    const [loadingSohbet, setLoadingSohbet] = useState(false);

    const [analizler, setAnalizler] = useState([]);
    const [loadingAnaliz, setLoadingAnaliz] = useState(false);

    const fetchSohbetGecmisi = async () => {
        setLoadingSohbet(true);
        try {
            const response = await api.get('/ai/asistan/gecmis');
            setSohbetler(response.data.data);
        } catch (error) {
            console.error("Context API Sohbet Çekme Hatası:", error);
        } finally {
            setLoadingSohbet(false);
        }
    };
    const fetchAnalizGecmisi = async () => {
        setLoadingAnaliz(true);
        try {
            const response = await api.get('/scan/gecmis');
            setAnalizler(response.data.data);
        } catch (error) {
            console.error("Context API Analiz Çekme Hatası:", error);
        } finally {
            setLoadingAnaliz(false);
        }
    };

    return (
        <KayitContext.Provider
            value={{
                sohbetler,
                loadingSohbet,
                fetchSohbetGecmisi,
                analizler,
                loadingAnaliz,    
                fetchAnalizGecmisi
            }}
        >
            {children}
        </KayitContext.Provider>
    );
};