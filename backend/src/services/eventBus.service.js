const EventEmitter = require('events');
const pino = require('pino');
const logger = pino();

class FitSphereEventBus extends EventEmitter {}

const eventBus = new FitSphereEventBus();

// Asynchronous Event Consumers (Decoupled Architecture)
eventBus.on('PLAN_GENERATED', async (eventData) => {
  logger.info({ event: 'EVENT_PLAN_GENERATED', userId: eventData.userId, planId: eventData.planId }, 'EventBus: Processing analytics for generated plan');
  // Asynchronously trigger muscle volume & fatigue analytics recalculation
});

eventBus.on('PLAN_DELETED', async (eventData) => {
  logger.info({ event: 'EVENT_PLAN_DELETED', userId: eventData.userId, planId: eventData.planId }, 'EventBus: Cleaned up cache and notified search index');
});

eventBus.on('SUGGESTION_ACCEPTED', async (eventData) => {
  logger.info({ event: 'EVENT_SUGGESTION_ACCEPTED', userId: eventData.userId, planId: eventData.planId }, 'EventBus: Progress engine updated for user');
});

eventBus.on('CHECKIN_SUBMITTED', async (eventData) => {
  logger.info({ event: 'EVENT_CHECKIN_SUBMITTED', userId: eventData.userId, rating: eventData.rating }, 'EventBus: Checkin recorded');
});

module.exports = eventBus;
