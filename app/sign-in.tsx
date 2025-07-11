import icons from '@/constants/icons'
import images from '@/constants/images'
import { login } from '@/lib/appwrite'
import { useGlobalContext } from '@/lib/global-provider'
import { Redirect } from 'expo-router'

import React from 'react'
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const SignIn = () => {
  const {refetch, loading, isLoggedIn} = useGlobalContext();

  if (!loading && isLoggedIn) return <Redirect href="/"/>
  const handleLogin =async() => { 
    const result = await login();

    if (result) {
      refetch();
    }else {
      Alert.alert('Error', 'Failed to Login');
    }
  };

  return (
    <SafeAreaView className='bg-white h-full'>
      <ScrollView contentContainerClassName='h-full'>
        <Image source={images.onboarding} className='w-full h-4/6' resizeMode='contain' />

        <View className='px-10'>

          <Text className="text-base text-center uppercase font-rubik text-black-300">
            Welcome to PropVista
          </Text>
          <Text className="text-2xl font-rubik-bold text-blue-900 text-center mt-2 leading-snug">
            Discover Your Dream Address
          </Text>
          <Text className="text-xl font-rubik-medium text-blue-800 text-center mt-1">
            Where Heart Meets Home
          </Text>

          <Text className='text-lg font-rubik text-black-200 text-center mt-12'>
            Login to PropVista with Google
          </Text>
          <TouchableOpacity onPress={handleLogin} className='bg-white shadow-md shadow-zinc-400 rounded-full w-full py-4 mt-5'>
            <View className='flex flex-row items-center justify-center'>
              <Image
                source={icons.google}
                className='w-5 h-5'
                resizeMode="contain"
              />
              <Text className='text-lg font-rubik-medium text-black-300 ml-2'>
              Continue with Google
              </Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn