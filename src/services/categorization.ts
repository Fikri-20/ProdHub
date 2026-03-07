import prisma from "../lib/prisma.js";

/** Parse rules from JSON string to string array. */
function parseRules(rules: string): string[] {
  try {
    const parsed: unknown = JSON.parse(rules);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

/**
 * Pure function: returns true if ANY rule regex matches appName OR windowTitle (case-insensitive).
 */
export function matchesCategory(
  appName: string,
  windowTitle: string,
  rules: string[],
): boolean {
  for (const rule of rules) {
    try {
      const regex = new RegExp(rule, "i");
      if (regex.test(appName) || regex.test(windowTitle)) {
        return true;
      }
    } catch {
      continue;
    }
  }
  return false;
}

/**
 * Load the user's categories with non-empty rules, run matching against the event,
 * and create CategoryAssignment records for matches.
 */
export async function categorizeEvent(
  eventId: string,
  appName: string,
  windowTitle: string,
  userId: string,
): Promise<void> {
  const categories = await prisma.category.findMany({
    where: { userId },
  });

  const matchingCategoryIds: string[] = [];

  for (const category of categories) {
    const rules = parseRules(category.rules);
    if (rules.length > 0 && matchesCategory(appName, windowTitle, rules)) {
      matchingCategoryIds.push(category.id);
    }
  }

  if (matchingCategoryIds.length > 0) {
    await prisma.categoryAssignment.createMany({
      data: matchingCategoryIds.map((categoryId) => ({
        eventId,
        categoryId,
      })),
      skipDuplicates: true,
    });
  }
}

const BATCH_SIZE = 500;

/**
 * Delete existing assignments for the given category, then re-scan the user's events
 * in batches and create new assignments for matches. Returns the count of newly assigned events.
 */
export async function recategorizeForCategory(
  categoryId: string,
  userId: string,
): Promise<number> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  // Delete all existing assignments for this category
  await prisma.categoryAssignment.deleteMany({
    where: { categoryId },
  });

  const rules = parseRules(category.rules);

  // If category has no rules, nothing to assign
  if (rules.length === 0) {
    return 0;
  }

  let assignedCount = 0;
  let skip = 0;

  // Batched scan of the user's events only
  while (true) {
    const events = await prisma.activityEvent.findMany({
      select: { id: true, appName: true, windowTitle: true },
      where: { device: { userId } },
      take: BATCH_SIZE,
      skip,
      orderBy: { id: "asc" },
    });

    if (events.length === 0) break;

    const matchingEventIds: string[] = [];
    for (const event of events) {
      if (matchesCategory(event.appName, event.windowTitle, rules)) {
        matchingEventIds.push(event.id);
      }
    }

    if (matchingEventIds.length > 0) {
      await prisma.categoryAssignment.createMany({
        data: matchingEventIds.map((eventId) => ({
          eventId,
          categoryId,
        })),
        skipDuplicates: true,
      });
      assignedCount += matchingEventIds.length;
    }

    if (events.length < BATCH_SIZE) break;
    skip += BATCH_SIZE;
  }

  return assignedCount;
}
