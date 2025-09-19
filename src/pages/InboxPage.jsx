// src/pages/InboxPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config.js';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// --- Componente para una fila de mensaje ---
const MessageItem = ({ request, onSelect }) => (
    <div 
        onClick={() => onSelect(request)} 
        className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${!request.isRead ? 'bg-blue-50' : 'bg-white'}`}
    >
        <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    {!request.isRead && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0"></div>}
                    <p className={`text-sm font-semibold truncate ${!request.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                        {request.visitorName}
                    </p>
                </div>
                <p className="text-sm text-gray-700 mt-1 truncate">
                    Contacto sobre: <span className="font-semibold">{request.designTitle}</span>
                </p>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {request.visitorMessage}
                </p>
            </div>
            <div className="text-right ml-4 flex-shrink-0">
                <p className="text-xs text-gray-400">
                    {request.createdAt?.toDate().toLocaleDateString()}
                </p>
            </div>
        </div>
    </div>
);

// --- Componente para ver el detalle del mensaje ---
const MessageDetail = ({ request, onClose }) => {
    if (!request) return null;

    return (
        <div className="bg-white p-6 border-l border-gray-200 h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Detalle del Mensaje</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            <div className="space-y-4">
                <div>
                    <p className="text-xs text-gray-500">Fecha</p>
                    <p>{request.createdAt?.toDate().toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">De</p>
                    <p className="font-semibold">{request.visitorName}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Email de Contacto</p>
                    <a href={`mailto:${request.visitorEmail}`} className="text-blue-600 hover:underline">{request.visitorEmail}</a>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Sobre el Diseño</p>
                    <p>{request.designTitle}</p>
                </div>
                <div className="border-t pt-4">
                    <p className="text-xs text-gray-500">Mensaje</p>
                    <p className="whitespace-pre-wrap">{request.visitorMessage}</p>
                </div>
            </div>
        </div>
    );
};


function InboxPage() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null); // Para mostrar el detalle
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const q = query(
                    collection(db, "contactRequests"), 
                    where("designerId", "==", user.uid), 
                    orderBy("createdAt", "desc")
                );

                const unsubscribeRequests = onSnapshot(q, (snapshot) => {
                    const userRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setRequests(userRequests);
                    setLoading(false);
                });

                return () => unsubscribeRequests();
            } else {
                navigate('/es/login');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    // Función para seleccionar un mensaje y marcarlo como leído
    const handleSelectRequest = async (request) => {
        setSelectedRequest(request);
        if (!request.isRead) {
            const requestRef = doc(db, "contactRequests", request.id);
            await updateDoc(requestRef, {
                isRead: true
            });
            console.log(`Mensaje ${request.id} marcado como leído.`);
        }
    };


    if (loading) {
        return <div className="p-6">Cargando mensajes...</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4 px-4">Buzón de Entrada</h1>
            <div className="bg-white rounded-lg shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-3">
                <div className="md:col-span-1 border-r border-gray-200 h-[calc(100vh-150px)] overflow-y-auto">
                    {requests.length > 0 ? (
                        requests.map(req => (
                            <MessageItem key={req.id} request={req} onSelect={handleSelectRequest} />
                        ))
                    ) : (
                        <p className="p-6 text-center text-gray-500">No tienes mensajes.</p>
                    )}
                </div>
                <div className="hidden md:block md:col-span-2">
                    {selectedRequest ? (
                        <MessageDetail request={selectedRequest} onClose={() => setSelectedRequest(null)} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-center text-gray-500">
                            <p>Selecciona un mensaje para ver los detalles.</p>
                        </div>
                    )}
                </div>
                {/* Vista de detalle para móvil (modal o nueva página sería mejor, pero esto funciona) */}
                {selectedRequest && (
                    <div className="md:hidden absolute inset-0 bg-white">
                         <MessageDetail request={selectedRequest} onClose={() => setSelectedRequest(null)} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default InboxPage;