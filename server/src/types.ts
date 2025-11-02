/**
 * Type definitions for the Travel Planner
 *
 * These interfaces define the shape of our data structures.
 * TypeScript will enforce these types at compile time.
 */

/**
 * Types of destinations we support
 */
export type DestinationType = "beach" | "mountain" | "city" | "cultural" | "adventure";

/**
 * Budget categories for trip planning
 */
export type BudgetLevel = "low" | "medium" | "high";

/**
 * Climate types for destinations
 */
export type ClimateType = "tropical" | "temperate" | "cold" | "arid";

/**
 * Core destination data structure
 */
export interface Destination {
  id: string;
  name: string;
  country: string;
  type: DestinationType;
  description: string;
  climate: ClimateType;

  // Cost information
  budgetLevel: BudgetLevel;
  averageDailyCost: number; // USD per day

  // Ratings and popularity
  rating: number; // 1-5
  popularityScore: number; // 1-100

  // Detailed information
  bestTimeToVisit: string[];
  topAttractions: string[];
  activities: string[];

  // Travel logistics
  averageStayDays: number;
  mainAirport: string;
}

/**
 * Activity in an itinerary
 */
export interface Activity {
  id: string;
  name: string;
  description: string;
  duration: number; // hours
  type: "sightseeing" | "dining" | "adventure" | "relaxation" | "cultural";
  cost: number; // USD
  timeOfDay: "morning" | "afternoon" | "evening";
}

/**
 * Single day in an itinerary
 */
export interface ItineraryDay {
  day: number;
  date?: string;
  destination: string; // destination ID
  activities: Activity[];
  totalCost: number;
  notes?: string;
}

/**
 * Complete travel itinerary
 */
export interface Itinerary {
  id: string;
  title: string;
  destinations: string[]; // destination IDs
  duration: number; // total days
  days: ItineraryDay[];
  totalCost: number;
  preferences: ItineraryPreferences;
  createdAt: string;
}

/**
 * User preferences for itinerary creation
 */
export interface ItineraryPreferences {
  pace: "relaxed" | "moderate" | "packed";
  interests: string[];
  budgetPerDay?: number;
  startDate?: string;
}

/**
 * Search criteria for finding destinations
 */
export interface SearchCriteria {
  query?: string;
  type?: DestinationType;
  budget?: BudgetLevel;
  climate?: ClimateType;
  minRating?: number;
}
