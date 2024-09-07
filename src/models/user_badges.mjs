import pkg from 'mongoose'
const { Schema, model, models } = pkg

export const UserBadges =
  models.user_badges ||
  model(
    'user_badges',
    new Schema({
      providerAccountId: String,
      badgeId: String,
      unLockDate: Date,
      announcementDate: Date,
    })
  )
