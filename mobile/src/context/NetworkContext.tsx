import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkContextType {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  isOffline: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  isConnected: true,
  isInternetReachable: true,
  isOffline: false,
});

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [netState, setNetState] = useState<NetInfoState | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetState(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const isOffline = netState !== null && (netState.isConnected === false || netState.isInternetReachable === false);

  return (
    <NetworkContext.Provider
      value={{
        isConnected: netState ? (netState.isConnected ?? true) : true,
        isInternetReachable: netState ? netState.isInternetReachable : true,
        isOffline,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
