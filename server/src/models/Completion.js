const mongoose = require('mongoose');

const completionSchema = new mongoose.Schema(
  {
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true
    },
    dateKey: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },
    completed: {
      type: Boolean,
      required: true,
      default: true
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

completionSchema.index({ habitId: 1, dateKey: 1 }, { unique: true });
completionSchema.index({ habitId: 1, dateKey: -1 });

module.exports = mongoose.model('Completion', completionSchema);
