import prisma from "../lib/prisma.js";

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
 * Load all categories with non-empty rules, run matching against the event,
 * and create CategoryAssignment records for matches.
 */
export async function categorizeEvent(
  eventId: string,
  appName: string,
  windowTitle: string,
): Promise<void> {
  const categories = await prisma.category.findMany({
    where: { rules: { isEmpty: false } },
  });

  const matchingCategoryIds: string[] = [];

  for (const category of categories) {
    if (matchesCategory(appName, windowTitle, category.rules)) {
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
 * Delete existing assignments for the given category, then re-scan all events
 * in batches and create new assignments for matches. Returns the count of newly assigned events.
 */
export async function recategorizeForCategory(
  categoryId: string,
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

  // If category has no rules, nothing to assign
  if (category.rules.length === 0) {
    return 0;
  }

  let assignedCount = 0;
  let skip = 0;

  // Batched scan of all events
  while (true) {
    const events = await prisma.activityEvent.findMany({
      select: { id: true, appName: true, windowTitle: true },
      take: BATCH_SIZE,
      skip,
      orderBy: { id: "asc" },
    });

    if (events.length === 0) break;

    const matchingEventIds: string[] = [];
    for (const event of events) {
      if (matchesCategory(event.appName, event.windowTitle, category.rules)) {
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
