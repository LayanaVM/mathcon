import React from 'react';

export interface ProfileCardProps {
  avatarUrl?: string;
  name?: string;
  theme?: 'dark' | 'light';
  backdropColor?: string;
  radius?: number;
  enableTilt?: boolean;
  tiltStrength?: number;
  enableMobileTilt?: boolean;
  mobileTiltSensitivity?: number;
  className?: string;
}

declare const ProfileCard: React.NamedExoticComponent<ProfileCardProps>;
export default ProfileCard;
