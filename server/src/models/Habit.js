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
      enum: ['daily', 'monSat', 'weekdays', 'specificDays'],
      required: true
    },
    weekdays: {
      type: [Number],
      default: [],
      validate: {
        validator: (days) => days.every((day) => Number.isInteger(day) && day >= 0 && day <= 6),
        message: 'weekdays must contain numbers from 0 (Sunday) through 6 (Saturday)'
      }
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
