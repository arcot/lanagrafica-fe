// Simple API connectivity test
import { restClient } from './restClient';
import { apiConfig } from '@/lib/api-config';

export async function testApiConnectivity(token: string) {
  console.log('🔍 Testing API connectivity...');
  console.log('API Configuration:', apiConfig);
  
  try {
    // Test basic connectivity with a simple endpoint
    const response = await restClient.get('/member/all/0', token);
    console.log('✅ API Connection successful!');
    console.log('Response received:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('❌ API Connection failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function testMemberOperations(token: string) {
  console.log('🧪 Testing member operations...');
  
  try {
    // Test getting all members (page 0)
    console.log('📋 Testing: Get all members...');
    const allMembersResponse = await restClient.get('/member/all/0', token);
    console.log('✅ Get all members successful:', allMembersResponse);
    
    // Test getting active members
    console.log('👥 Testing: Get active members...');
    const activeMembersResponse = await restClient.get('/member/active/0', token);
    console.log('✅ Get active members successful:', activeMembersResponse);
    
    return { 
      success: true, 
      results: {
        allMembers: allMembersResponse,
        activeMembers: activeMembersResponse
      }
    };
  } catch (error) {
    console.error('❌ Member operations test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}