import { AuditService } from '../../src/notifications/services/AuditService';
import { NotificationService } from '../../src/notifications/services/NotificationService';
import { AuditLog } from '../../src/notifications/models/AuditLog';
import { Notification } from '../../src/notifications/models/Notification';

describe('AuditService', () => {
  let service: AuditService;
  let repository: any;
  let logger: any;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findByProjectId: jest.fn(),
    };

    logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    service = new AuditService(repository, logger);
  });

  it('records an immutable audit event with before and after state', async () => {
    const entry: AuditLog = {
      id: 'audit-1',
      eventType: 'project_created',
      entityType: 'project',
      entityId: 'project-1',
      projectId: 'project-1',
      actorUserId: 'user-1',
      actorOrganisationId: 'org-1',
      previousState: { status: 'draft' },
      newState: { status: 'active' },
      timestamp: new Date(),
    };

    repository.create.mockResolvedValue(entry);

    const result = await service.recordAudit({
      eventType: 'project_created',
      entityType: 'project',
      entityId: 'project-1',
      projectId: 'project-1',
      actorUserId: 'user-1',
      actorOrganisationId: 'org-1',
      previousState: { status: 'draft' },
      newState: { status: 'active' },
    });

    expect(result).toEqual(entry);
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'project_created',
      entityType: 'project',
      entityId: 'project-1',
      projectId: 'project-1',
      actorUserId: 'user-1',
      actorOrganisationId: 'org-1',
    }));
  });

  it('rejects attempts to update existing audit entries', async () => {
    await expect(service.update('audit-1', {} as any)).rejects.toThrow('Audit entries are immutable');
    await expect(service.delete('audit-1')).rejects.toThrow('Audit entries are immutable');
  });

  it('returns audit history for a project filtered by event type', async () => {
    const auditEntries: AuditLog[] = [
      {
        id: 'audit-1',
        eventType: 'project_created',
        entityType: 'project',
        entityId: 'project-1',
        projectId: 'project-1',
        actorUserId: 'user-1',
        actorOrganisationId: 'org-1',
        previousState: null,
        newState: { status: 'active' },
        timestamp: new Date('2024-01-01T00:00:00.000Z'),
      },
    ];

    repository.findByProjectId.mockResolvedValue(auditEntries);

    const history = await service.getProjectHistory('org-1', 'project-1', {
      eventType: 'project_created',
      startDate: '2024-01-01',
      endDate: '2024-02-01',
    });

    expect(history).toEqual(auditEntries);
    expect(repository.findByProjectId).toHaveBeenCalledWith('project-1', 'org-1', {
      eventType: 'project_created',
      startDate: '2024-01-01',
      endDate: '2024-02-01',
    });
  });
});

describe('NotificationService', () => {
  let service: NotificationService;
  let repository: any;
  let logger: any;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      createMany: jest.fn(),
      findUnreadByUser: jest.fn(),
      markAsRead: jest.fn(),
    };

    logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    service = new NotificationService(repository, logger);
  });

  it('creates notifications for relevant team members on project milestone changes', async () => {
    const notifications = [
      {
        id: 'n-1',
        recipientUserId: 'user-1',
        eventType: 'project_created',
        projectId: 'project-1',
        message: 'Project project-1 was created',
        isRead: false,
        createdAt: new Date(),
      },
      {
        id: 'n-2',
        recipientUserId: 'user-2',
        eventType: 'project_created',
        projectId: 'project-1',
        message: 'Project project-1 was created',
        isRead: false,
        createdAt: new Date(),
      },
    ] as Notification[];

    repository.createMany.mockResolvedValue(notifications);

    const result = await service.notifyProjectMembers({
      projectId: 'project-1',
      eventType: 'project_created',
      message: 'Project project-1 was created',
      recipients: ['user-1', 'user-2'],
    });

    expect(result).toEqual(notifications);
    expect(repository.createMany).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ projectId: 'project-1', eventType: 'project_created', isRead: false }),
    ]));
  });

  it('lists unread notifications for a user', async () => {
    const unread: Notification[] = [
      {
        id: 'n-1',
        recipientUserId: 'user-1',
        eventType: 'project_status_updated',
        projectId: 'project-1',
        message: 'Project status changed',
        isRead: false,
        createdAt: new Date(),
      },
    ];

    repository.findUnreadByUser.mockResolvedValue(unread);

    const result = await service.getUnreadNotifications('user-1');

    expect(result).toEqual(unread);
    expect(repository.findUnreadByUser).toHaveBeenCalledWith('user-1');
  });

  it('marks a notification as read', async () => {
    repository.markAsRead.mockResolvedValue({
      id: 'n-1',
      recipientUserId: 'user-1',
      eventType: 'project_status_updated',
      projectId: 'project-1',
      message: 'Project status changed',
      isRead: true,
      createdAt: new Date(),
    });

    const result = await service.markNotificationAsRead('n-1');

    expect(result).toEqual(expect.objectContaining({ id: 'n-1', isRead: true }));
    expect(repository.markAsRead).toHaveBeenCalledWith('n-1');
  });
});
