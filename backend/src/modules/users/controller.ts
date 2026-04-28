import { type Response, type Request } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import * as userService from './service.js';
import type { UpdateProfileInput } from './schemas.js';
import type { ProfileSetupInput } from '../auth/schemas.js';
import { createClerkClient } from '@clerk/backend';

export async function profileSetup(req: Request, res: Response) {
  try {
    const input = req.body as ProfileSetupInput;
    
    const user = await userService.createOrUpdateClerkUser(input);
    
    // Update Clerk public metadata
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    await clerkClient.users.updateUserMetadata(input.clerkId, {
      publicMetadata: {
        role: input.role
      }
    });
    
    res.json({
      success: true,
      data: user,
      message: 'Profile setup completed successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Profile setup failed';
    res.status(400).json({
      success: false,
      error: message,
    });
  }
}

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  
  const user = await userService.getUserById(userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  res.json({
    success: true,
    data: user,
  });
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.userId;
  const input = req.body as UpdateProfileInput;
  
  const user = await userService.updateProfile(userId, input);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  res.json({
    success: true,
    data: user,
    message: 'Profile updated successfully',
  });
}

export async function getAllUsers(req: AuthenticatedRequest, res: Response) {
  const users = await userService.getAllUsers();
  
  res.json({
    success: true,
    data: users,
  });
}

export async function getGovtUsers(req: AuthenticatedRequest, res: Response) {
  const users = await userService.getUsersByRole('govt');
  
  res.json({
    success: true,
    data: users,
  });
}

export async function getNgoUsers(req: AuthenticatedRequest, res: Response) {
  const users = await userService.getUsersByRole('ngo');
  
  res.json({
    success: true,
    data: users,
  });
}