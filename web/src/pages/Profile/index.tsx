import React, {useState} from 'react';

import '.styles.css';
import PageHeader from '../../components/PageHeader';

function Profile() {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bio, setBio] = useState('');

  const [subject, setSubject] = useState('');
  const [cost, setCost] = useState('');

  const [scheduleItems, setScheduleItems] = useState([
    { week_day: 0, from: '', to: '' }
  ]);
  return (
    <div>
      <PageHeader
        pageName="Meu perfil"
        title=""
      >
        
      </PageHeader>
    </div> 
  )
}

export default Profile;