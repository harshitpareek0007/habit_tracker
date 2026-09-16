const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 120
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekdays'],
      required: true
    },
    timezone: {
      type: String,
      trim: true,
      default: 'UTC',
      validate: {
        validator: (value) => {
          try {
            new Intl.DateTimeFormat('en-US', { timeZone: value }).format();
            return true;
          } catch {
            return false;
          }
        },
        message: 'timezone must be a valid IANA timezone'
      }
    },
    archivedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

habitSchema.index({ archivedAt: 1, updatedAt: -1 });
habitSchema.index({ name: 1 });

module.exports = mongoose.model('Habit', habitSchema);
