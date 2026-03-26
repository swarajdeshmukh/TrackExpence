import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import userModel from "../models/userModel.js";

function createToken(userId) {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );
}

// Register a user {name, email, password: hashPassword}
export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be atleast 8 character.",
    });
  }

  try {
    if (await userModel.findOne({ email })) {
      return res.status(409).json({
        success: false,
        message: "User already present",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashPassword,
    });

    const token = createToken(user._id);

    res.status(201).json({
      success: true,
      message: "User register successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

// Login a user {email, password: hashPassword}
export async function login(req, res) {
     const email = req.body.email?.toLowerCase().trim();
     const password = req.body.password?.trim();

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Both fields are required"
        })
    }

    try {
        const user = await userModel.findOne({ email })
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            })
        }

        const match = await bcrypt.compare(password, user.password)

        if (!match) {
            return res.status(401).json({
              success: false,
              message: "Invalid email or password",
            });
        }

        const token = createToken(user._id);

        res.status(200).json({
            success: true,
            message:"Log-in successfull",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })

    } catch (err) {
        console.error(err);
        res.status(500).json({
          success: false,
          message: "Server error",
        });
    }

}

// To get current login user details {req.user.id}
export async function getCurrentUser(req, res) {
    try {
        const user = await userModel.findById(req.user.id).select("name email");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "User detais fetched successfully.",
            user
        })
    } catch (err) {
         console.error(err);
         res.status(500).json({
           success: false,
           message: "Server error",
         });
    }
}

// To update user profile {name, email}
export async function updateUserProfile(req, res) {
    const name = req.body.name?.trim();
    const email = req.body.email?.toLowerCase().trim();

    
  if (!req.user?.id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: "Name and email are required",
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email",
    });
  }

    try {
      const userExist = await userModel.findOne({
        email,
        _id: { $ne: req.user.id },
      });
      if (userExist) {
        return res.status(409).json({
          success: false,
          message: "Email already in use.",
        });
      }

      const user = await userModel.findByIdAndUpdate(
        req.user.id,
        { name, email },
        { new: true, runValidators: true, select: "name email" },
      );
      res.status(200).json({
        success: true,
        message: "User details updated successfully.",
        user,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
}


// To Change user password
export async function updatePassword(req, res) {
    const { currentPassword, newPassword } = req.body;

     if (!req.user?.id) {
       return res.status(401).json({
         success: false,
         message: "Unauthorized",
       });
    }
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Current and new password are required",
        });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters",
        });
    }

      if (currentPassword === newPassword) {
        return res.status(400).json({
          success: false,
          message: "New password must be different from current password",
        });
      }

    try {
      const user = await userModel.findById(req.user.id).select("+password");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const match = await bcrypt.compare(currentPassword, user.password);

      if (!match) {
        return res.status(401).json({
          success: false,
          message: "Current Password is incorrect.",
        });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
}