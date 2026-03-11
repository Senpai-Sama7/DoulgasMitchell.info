'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  FolderOpen,
  Award,
  BookOpen,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  featured: boolean;
  updatedAt: string;
  href: string;
}

interface ContentApiResponse {
  success: boolean;
  articles: ContentItem[];
  projects: ContentItem[];
  certifications: ContentItem[];
  books: ContentItem[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function getStatusBadge(status: string) {
  const normalized = status.toLowerCase();
  const variants: Record<string, { color: string; icon: typeof Check }> = {
    published: { color: 'bg-green-500/10 text-green-500', icon: Check },
    completed: { color: 'bg-green-500/10 text-green-500', icon: Check },
    draft: { color: 'bg-yellow-500/10 text-yellow-500', icon: Eye },
    archived: { color: 'bg-gray-500/10 text-gray-500', icon: X },
    'in-progress': { color: 'bg-blue-500/10 text-blue-500', icon: Eye },
  };

  const { color, icon: Icon } = variants[normalized] || variants.draft;

  return (
    <Badge variant="secondary" className={cn(color, 'flex items-center gap-1 w-fit')}>
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function ContentTable({ items }: { items: ContentItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Featured</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">/{item.slug}</p>
              </div>
            </TableCell>
            <TableCell>{getStatusBadge(item.status)}</TableCell>
            <TableCell>
              {item.featured ? (
                <Badge variant="default" className="bg-primary/10 text-primary">
                  Featured
                </Badge>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell>{new Date(item.updatedAt).toLocaleDateString()}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <Edit className="h-4 w-4 mr-2" />
                    Editor coming soon
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled className="text-muted-foreground">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete locked
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState('articles');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ContentApiResponse>({
    success: true,
    articles: [],
    projects: [],
    certifications: [],
    books: [],
  });

  useEffect(() => {
    const controller = new AbortController();

    const loadContent = async () => {
      try {
        const response = await fetch('/api/admin/content', { signal: controller.signal });
        const data = (await response.json()) as ContentApiResponse;
        if (response.ok) {
          setContent(data);
        }
      } catch {
        return;
      } finally {
        setLoading(false);
      }
    };

    void loadContent();

    return () => controller.abort();
  }, []);

  const filteredContent = useMemo(() => {
    const matcher = (item: ContentItem) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchQuery.toLowerCase());

    return {
      articles: content.articles.filter(matcher),
      projects: content.projects.filter(matcher),
      certifications: content.certifications.filter(matcher),
      books: content.books.filter(matcher),
    };
  }, [content, searchQuery]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">Review the live editorial inventory and launch previews.</p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Editor coming soon
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div variants={item} className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="articles">
              <FileText className="h-4 w-4 mr-2" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="projects">
              <FolderOpen className="h-4 w-4 mr-2" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="certifications">
              <Award className="h-4 w-4 mr-2" />
              Certifications
            </TabsTrigger>
            <TabsTrigger value="books">
              <BookOpen className="h-4 w-4 mr-2" />
              Books
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Articles ({filteredContent.articles.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <p className="text-sm text-muted-foreground">Loading content…</p> : <ContentTable items={filteredContent.articles} />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Projects ({filteredContent.projects.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <p className="text-sm text-muted-foreground">Loading content…</p> : <ContentTable items={filteredContent.projects} />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Certifications ({filteredContent.certifications.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <p className="text-sm text-muted-foreground">Loading content…</p> : <ContentTable items={filteredContent.certifications} />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="books" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Books ({filteredContent.books.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <p className="text-sm text-muted-foreground">Loading content…</p> : <ContentTable items={filteredContent.books} />}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
