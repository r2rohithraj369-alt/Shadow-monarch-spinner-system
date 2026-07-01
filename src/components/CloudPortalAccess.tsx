import React, { useState, useEffect } from "react";
import { cloudSync, SyncState } from "../utils/cloudSyncManager";
import { getSupabase } from "../utils/supabaseClient";
import { 
  Cloud, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Chrome, 
  LogOut, 
  Download, 
  Upload, 
  Shield,
  Clock,
  Wifi,
  WifiOff
} from "lucide-react";

interface CloudPortalAccessProps {
  onEnterLocalSystem?: () => void;
  onEnterGuestSystem: () => void;
  isLoggedInInReact: boolean;
  onReactLogin: (email: string | null) => void;
  onReactLogout: () => void;
  isGuestMode?: boolean;
}

export default function CloudPortalAccess({ 
  onEnterLocalSystem, 
  onEnterGuestSystem,
  isLoggedInInReact, 
  onReactLogin,
  onReactLogout,
  isGuestMode = false
}: CloudPortalAccessProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync state tracking
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [syncMessage, setSyncMessage] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine);

  // Load state logs
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  useEffect(() => {
    // Audit config status
    setSupabaseConfigured(getSupabase() !== null);
    
    // Register status listeners
    cloudSync.registerSyncStateListener((state: SyncState, msg?: string) => {
      setSyncState(state);
      if (msg) {
        setSyncMessage(msg);
      }
      
      const stamp = localStorage.getItem("monarch_sync_updated_at");
      if (stamp && stamp !== "0") {
        setLastSyncTime(new Date(parseInt(stamp, 10)).toLocaleTimeString());
      }
    });

    // Handle online/offline events
    const goOnline = () => {
      setNetworkStatus(true);
      if (!isGuestMode) {
        cloudSync.triggerInitialSync();
      }
    };
    const goOffline = () => setNetworkStatus(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    // Initial auth tracking check
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }: any) => {
        if (session?.user && !isGuestMode) {
          setCurrentUser(session.user);
          onReactLogin(session.user.email);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user && !isGuestMode) {
          setIsLoading(false);
          setCurrentUser(session.user);
          onReactLogin(session.user.email);
        } else if (event === "SIGNED_OUT") {
          setIsLoading(false);
          setCurrentUser(null);
          if (!isGuestMode) {
            onReactLogout();
          }
        }
      });

      return () => {
        subscription.unsubscribe();
        window.removeEventListener("online", goOnline);
        window.removeEventListener("offline", goOffline);
      };
    }

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [isGuestMode]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await cloudSync.signInWithGoogle();
      // Supabase OAuth performs redirect
    } catch (err: any) {
      setAuthError(err.message || "Failed to trigger Google Authentication.");
      setIsLoading(false);
    }
  };

  const handleManualPush = async () => {
    await cloudSync.manualSyncPush();
    const stamp = localStorage.getItem("monarch_sync_updated_at");
    if (stamp) {
      setLastSyncTime(new Date(parseInt(stamp, 10)).toLocaleTimeString());
    }
  };

  const handleManualPull = async () => {
    await cloudSync.manualSyncPull();
    const stamp = localStorage.getItem("monarch_sync_updated_at");
    if (stamp) {
      setLastSyncTime(new Date(parseInt(stamp, 10)).toLocaleTimeString());
    }
  };

  const handleExit = async () => {
    if (isGuestMode) {
      onReactLogout();
    } else {
      await cloudSync.signOut();
      onReactLogout();
    }
  };

  // Render option 1: Logged in - displays control board widget
  if (isLoggedInInReact) {
    return (
      <div id="cloud-sync-control-panel" className="bg-gradient-to-tr from-[#0b0c16]/98 to-[#0e0821]/98 border border-[#7B2FFF]/30 rounded-2xl p-5 space-y-4 shadow-[0_0_25px_rgba(123,47,255,0.15)] relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full filter blur-[20px]" />
        
        <div className="flex items-center justify-between border-b border-gray-900 pb-3">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-cyan-400 animate-pulse animate-duration-1000" />
            <div>
              <span className="text-[9px] font-mono text-cyan-400 font-bold tracking-widest block uppercase">SYS PERSISTENCE CENTER</span>
              <span className="text-[12px] font-mono text-white font-extrabold uppercase mt-0.5 block">NEXUS STATUS FEED</span>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase rounded px-2 py-0.5 bg-black/40 border border-gray-900">
            {networkStatus ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-500" />
                <span className="text-amber-500">OFFLINE</span>
              </>
            )}
          </span>
        </div>

        {/* Current Connection Details */}
        <div className="space-y-2 text-xs font-mono bg-black/40 border border-gray-900/60 rounded-xl p-3">
          <div className="flex justify-between items-center text-gray-400">
            <span>Identity Profile:</span>
            <span className="text-white font-semibold truncate max-w-[170px]" title={isGuestMode ? "Temporary Guest User" : (currentUser?.email || "Authenticated")}>
              {isGuestMode ? "TEMPORARY GUEST" : (currentUser?.email || "Authenticated")}
            </span>
          </div>
          <div className="flex justify-between items-center text-gray-400">
            <span>Server Sync Target:</span>
            <span className={isGuestMode ? "text-rose-455 font-bold text-rose-400" : (supabaseConfigured ? "text-cyan-400 font-bold" : "text-amber-500")}>
              {isGuestMode ? "Bypassed (Ephemeral Memory)" : (supabaseConfigured ? "Supabase Cloud Database" : "Offline Local Persistence")}
            </span>
          </div>
          <div className="flex justify-between items-center text-gray-400">
            <span>Cloud Sync Status:</span>
            <span className={`font-bold uppercase tracking-wider ${
              isGuestMode ? "text-rose-400" : (syncState === "success" ? "text-emerald-400" :
              syncState === "syncing" ? "text-cyan-400 animate-pulse" :
              syncState === "error" ? "text-rose-400" : "text-gray-400")
            }`}>
              {isGuestMode ? "DEACTIVATED" : (syncState === "idle" ? "READY" : syncState)}
            </span>
          </div>
          {isGuestMode ? (
            <p className="text-[10px] text-red-400 italic mt-1 border-t border-red-950 pt-1.5 leading-relaxed uppercase">
              ⚠️ Transient Guest: Close app or refresh page to wipe statistics.
            </p>
          ) : (
            <>
              {syncMessage && (
                <p className="text-[10px] text-gray-450 italic mt-1 border-t border-gray-900 pt-1.5 leading-relaxed">
                  &gt; {syncMessage}
                </p>
              )}
              {lastSyncTime && (
                <div className="flex items-center gap-1.5 text-[9px] text-[#7B2FFF] mt-1 border-t border-gray-900 pt-1">
                  <Clock className="w-3 h-3" />
                  <span>Perfect Cloud Sync Anchor: {lastSyncTime}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sync Controls */}
        {!isGuestMode && (
          supabaseConfigured ? (
            <div className="grid grid-cols-2 gap-2 pb-2">
              <button
                onClick={handleManualPush}
                disabled={syncState === "syncing" || !networkStatus}
                className="px-3 py-2 bg-purple-950/20 hover:bg-purple-950/50 border border-purple-500/20 text-purple-200 text-[10px] font-mono font-bold tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                title="Force upload all your current local performance states, levels, and items to the Cloud database"
              >
                <Upload className="w-3.5 h-3.5 text-purple-400" />
                BACKUP CLOUD
              </button>
              <button
                onClick={handleManualPull}
                disabled={syncState === "syncing" || !networkStatus}
                className="px-3 py-2 bg-cyan-950/20 hover:bg-cyan-950/50 border border-cyan-500/20 text-cyan-200 text-[10px] font-mono font-bold tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                title="Pull of your latest recorded progress on files or other devices from the cloud database to instantly overwrite local state"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                RESTORE STATE
              </button>
            </div>
          ) : (
            <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl space-y-2 text-[11px] leading-relaxed text-amber-300">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Supabase Keys Unconfigured</span>
              </div>
              <p className="font-mono">
                Running in offline local cache mode. Complete cloud restoration is deactivated because environment variables are not detected yet.
              </p>
            </div>
          )
        )}

        {/* Sign out */}
        <button
          onClick={handleExit}
          className="w-full px-4 py-2 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/25 text-rose-300 hover:text-white text-[10px] font-mono font-black tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5" />
          {isGuestMode ? "EXIT GUEST MODE (WIPE TEMP DATA)" : "DISCONNECT MATRIX ACCOUNT"}
        </button>
      </div>
    );
  }

  // Render option 2: Auth Entry page rendered when isLoggedIn is false
  return (
    <div id="cloud-matrix-login-deck" className="w-full max-w-md mx-auto bg-black/70 border border-[#7B2FFF]/30 rounded-2xl p-6 space-y-6 shadow-[0_0_40px_rgba(123,47,255,0.15)] backdrop-blur-md relative overflow-hidden text-left">
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#7B2FFF] to-transparent" />
      
      <div className="text-center space-y-2">
        <h2 className="text-xs font-mono tracking-[0.25em] text-[#00D9FF] font-extrabold uppercase">AWAKEN YOUR PHYSICAL EVOLUTION</h2>
        <p className="text-[11px] text-gray-400 font-mono">Continuous sync backup or temporary transient offline access</p>
      </div>

      <div className="space-y-5">
        {/* Google Authentication */}
        <div className="space-y-2">
          <span className="text-[9px] font-mono text-[#7B2FFF] font-bold block uppercase tracking-wider">CLOUD BACKUP SIGN-IN</span>
          {supabaseConfigured ? (
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading || !networkStatus}
              className="w-full py-3 bg-gradient-to-r from-[#12121e] to-[#0c0c16] border border-gray-800 hover:border-[#7B2FFF]/50 text-white text-xs font-mono font-bold tracking-wider rounded-xl shadow-md hover:shadow-[0_0_15px_rgba(123,47,255,0.2)] flex items-center justify-center gap-2.5 transition-all duration-300 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Chrome className="w-4 h-4 text-cyan-400" />
              <span>CONTINUE WITH GOOGLE ACCOUNT</span>
            </button>
          ) : (
            <div className="p-3 bg-red-950/20 border border-red-500/10 rounded-xl text-[10.5px] font-mono leading-relaxed text-red-400 text-center uppercase">
              Supabase Not Configured - Google Sign-In Unavailable
            </div>
          )}
          {authError && (
            <div className="p-3 bg-rose-950/20 border border-rose-500/25 text-rose-300 rounded-xl text-[11px] leading-relaxed flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}
          <p className="text-[10px] text-gray-500 font-mono leading-relaxed text-center px-1">
            Secures profile progress, levels, and training metrics permanently in cloud storage.
          </p>
        </div>

        <div className="flex items-center gap-2 text-gray-800 font-mono text-[9px] uppercase font-bold justify-center my-3 select-none">
          <span className="w-12 h-[1px] bg-gray-900" />
          <span>OR CHOOSE METADATA</span>
          <span className="w-12 h-[1px] bg-gray-900" />
        </div>

        {/* Guest Mode Section */}
        <div className="space-y-3 p-4 bg-[#0a0a0b] border border-gray-900 rounded-xl">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-amber-500 font-bold block uppercase tracking-wider">OFFLINE ENTRY</span>
            <span className="text-xs font-bold text-white block">PLAY AS GUEST USER</span>
          </div>

          <div className="p-2 sm:p-2.5 bg-amber-950/15 border border-amber-500/20 rounded-lg text-[10px] text-amber-400/90 font-mono leading-relaxed">
            ⚠️ <strong>CRITICAL DATA NOTE:</strong> In guest mode, your levels and quests run purely in temporary local browser memory. <strong>Closing this browser tab or refreshing the page will permanently wipe your progress.</strong>
          </div>

          <button
            onClick={onEnterGuestSystem}
            className="w-full py-3 bg-black/60 hover:bg-cyan-950/20 border border-gray-800 hover:border-cyan-500/40 text-gray-300 hover:text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>ENTER OFF-THE-GRID GUEST MODE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
