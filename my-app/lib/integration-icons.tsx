import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSlack, 
  faNotion, 
  faGoogle, 
  faGoogleDrive, 
  faDropbox 
} from '@fortawesome/free-brands-svg-icons';
import { 
  faAddressBook, 
  faCalendar, 
  faVideo 
} from '@fortawesome/free-solid-svg-icons';


export const getIntegrationIcon = (slug: string, size: '1x' | '2x' | '3x' | '4x' | '5x' = '1x'): React.ReactNode => {
  switch (slug) {
    case 'slack':
      return <FontAwesomeIcon icon={faSlack} size={size} />;
    case 'notion':
      return <FontAwesomeIcon icon={faNotion} size={size} />;
    case 'gmail':
      return <FontAwesomeIcon icon={faGoogle} size={size} />;
    case 'google-drive':
      return <FontAwesomeIcon icon={faGoogleDrive} size={size} />;
    case 'google-calendar':
      return <FontAwesomeIcon icon={faCalendar} size={size} />;
    case 'google-contacts':
      return <FontAwesomeIcon icon={faAddressBook} size={size} />;
    case 'dropbox':
      return <FontAwesomeIcon icon={faDropbox} size={size} />;
    case 'zoom':
      return <FontAwesomeIcon icon={faVideo} size={size} />;
    default:
      return null;
  }
};
