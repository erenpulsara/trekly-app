import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { BottomTabNavigator } from './BottomTabNavigator';
import { TourDetailScreen } from '../screens/tours/TourDetailScreen';
import { PopularToursScreen } from '../screens/tours/PopularToursScreen';
import { BookingFormScreen } from '../screens/bookings/BookingFormScreen';
import { BookingSuccessScreen } from '../screens/bookings/BookingSuccessScreen';
import { MyBookingsScreen } from '../screens/bookings/MyBookingsScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { BlogDetailScreen } from '../screens/blog/BlogDetailScreen';
import { AboutScreen } from '../screens/about/AboutScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { FavoritesScreen } from '../screens/profile/FavoritesScreen';
import { LeaderboardScreen } from '../screens/profile/LeaderboardScreen';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  Main: undefined;
  TourDetail: { tourId: string };
  BookingForm: { tourId: string; tourDateId?: string };
  BookingSuccess: {
    bookingId: string;
    tourId: string;
    isWebBooking?: boolean;
    participantCount?: number;
  };
  MyBookings: undefined;
  PopularTours: undefined;
  BlogDetail: { slug: string };
  About: undefined;
  EditProfile: undefined;
  Favorites: undefined;
  Leaderboard: undefined;
};

const AuthStack = createStackNavigator<AuthStackParamList>();
const MainStack = createStackNavigator<MainStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Main" component={BottomTabNavigator} />
      <MainStack.Screen name="TourDetail" component={TourDetailScreen} />
      <MainStack.Screen name="PopularTours" component={PopularToursScreen} />
      <MainStack.Screen name="BookingForm" component={BookingFormScreen} />
      <MainStack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
      <MainStack.Screen name="MyBookings" component={MyBookingsScreen} />
      <MainStack.Screen name="BlogDetail" component={BlogDetailScreen} />
      <MainStack.Screen name="About" component={AboutScreen} />
      <MainStack.Screen name="EditProfile" component={EditProfileScreen} />
      <MainStack.Screen name="Favorites" component={FavoritesScreen} />
      <MainStack.Screen name="Leaderboard" component={LeaderboardScreen} />
    </MainStack.Navigator>
  );
}

export function AppNavigator() {
  const { user, isGuest, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <NavigationContainer>
      {user || isGuest ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
