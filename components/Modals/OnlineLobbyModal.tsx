'use client';

import React from 'react';
import { OnlineRoomState } from '@/lib/types';
import ChoiceView from './OnlineLobby/ChoiceView';
import CreateRoomView from './OnlineLobby/CreateRoomView';
import JoinRoomView from './OnlineLobby/JoinRoomView';
import WaitingLobbyView from './OnlineLobby/WaitingLobbyView';
import { useLobbyController } from './OnlineLobby/useLobbyController';

interface OnlineLobbyModalProps {
  initialRoomCode?: string;
  hasActiveGame?: boolean;
  onGameStarted: (room: OnlineRoomState, myPlayerId: number) => void;
  onBackToModeSelect: () => void;
  onClose?: () => void;
}

const AVAILABLE_AVATARS = ['🦁', '🦅', '🐸', '🦊', '🐙', '🐬', '🐼', '🐯', '🚀', '⭐'];

export default function OnlineLobbyModal({
  initialRoomCode = '',
  hasActiveGame = false,
  onGameStarted,
  onBackToModeSelect,
  onClose,
}: OnlineLobbyModalProps) {
  const {
    subView,
    setSubView,
    name,
    setName,
    avatar,
    setAvatar,
    roomCodeInput,
    setRoomCodeInput,
    currentRoom,
    myPlayerId,
    loading,
    errorMsg,
    copiedLink,
    handleCreateRoom,
    handleJoinRoom,
    handleLeaveLobby,
    handleHostStartGame,
    handleCopyLink,
  } = useLobbyController({ initialRoomCode, onGameStarted });

  return (
    <div className="modal-backdrop is-open">
      <div className="modal-card-center" style={{ maxWidth: '480px', position: 'relative' }}>
        {(onClose || subView === 'CHOICE') && (
          <button
            type="button"
            onClick={onClose || onBackToModeSelect}
            aria-label="Tutup dan kembali"
            title="Kembali"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'var(--color-surface)',
              border: '2px solid var(--border-color)',
              borderRadius: '6px',
              padding: '3px 8px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px var(--border-color)',
              lineHeight: 1,
              zIndex: 10,
            }}
          >
            ✕
          </button>
        )}

        {subView === 'CHOICE' && (
          <ChoiceView
            hasActiveGame={hasActiveGame}
            onCreateClick={() => setSubView('CREATE')}
            onJoinClick={() => setSubView('JOIN')}
            onBack={onBackToModeSelect}
          />
        )}

        {subView === 'CREATE' && (
          <CreateRoomView
            name={name}
            setName={setName}
            avatar={avatar}
            setAvatar={setAvatar}
            availableAvatars={AVAILABLE_AVATARS}
            loading={loading}
            errorMsg={errorMsg}
            onSubmit={handleCreateRoom}
            onCancel={() => setSubView('CHOICE')}
          />
        )}

        {subView === 'JOIN' && (
          <JoinRoomView
            roomCodeInput={roomCodeInput}
            setRoomCodeInput={setRoomCodeInput}
            name={name}
            setName={setName}
            avatar={avatar}
            setAvatar={setAvatar}
            availableAvatars={AVAILABLE_AVATARS}
            loading={loading}
            errorMsg={errorMsg}
            onSubmit={handleJoinRoom}
            onCancel={() => setSubView('CHOICE')}
          />
        )}

        {subView === 'LOBBY' && currentRoom && myPlayerId && (
          <WaitingLobbyView
            currentRoom={currentRoom}
            myPlayerId={myPlayerId}
            copiedLink={copiedLink}
            loading={loading}
            errorMsg={errorMsg}
            onCopyLink={handleCopyLink}
            onHostStart={handleHostStartGame}
            onLeave={handleLeaveLobby}
          />
        )}
      </div>
    </div>
  );
}
