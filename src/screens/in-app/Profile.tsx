import { View, Text } from 'react-native'
import React, { FC } from 'react'
import { useUI } from '@context/UiProvider'
import CustomText from '@components/CustomText';

const Profile:FC = () => {
  const {theme} = useUI();
  return (
    <View style={{flex:1,justifyContent:"center",alignItems:"center",backgroundColor:theme.background}}>
      <CustomText>Profile</CustomText>
    </View>
  )
}

export default Profile