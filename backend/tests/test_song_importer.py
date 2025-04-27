import unittest
from unittest.mock import Mock

from importer.song_importer import SongImporter


class TestSongImporter(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # This method is called once for the entire class
        # You can set up any class-level resources here
        pass

    @classmethod
    def tearDownClass(cls):
        # This method is called once for the entire class
        # You can clean up any class-level resources here
        pass

    def setUp(self):
        # This method is called before each test method
        # You can set up any instance-level resources here
        pass

    def tearDown(self):
        # This method is called after each test method
        # You can clean up any instance-level resources here
        pass

    def test_assertion(self):
        self.assertTrue(True)

    def test_upsert_to_supabase(self):
        rows = [
            {"id": 1, "title": "Song 1", "anime": "Anime 1"},
            {"id": 2, "title": "Song 2", "anime": "Anime 2"},
        ]
        mock_supabase = Mock()
        mock_supabase.table("anime_songs").upsert(rows).execute()
        importer = SongImporter(mock_supabase)
        importer.upsert_to_supabase(rows)

